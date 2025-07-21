const express = require("express");
const User = require("../models/User");
const { QuizAttempt } = require("../models/Quiz");
const { auth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/user/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get("/dashboard", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    // Get recent quiz attempts
    const recentAttempts = await QuizAttempt.find({ userId: req.user._id })
      .populate("quizId", "title subject")
      .sort({ completedAt: -1 })
      .limit(5);

    // Calculate progress this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const thisWeekAttempts = await QuizAttempt.find({
      userId: req.user._id,
      completedAt: { $gte: weekAgo },
    });

    const thisWeekStats = {
      quizzesTaken: thisWeekAttempts.length,
      averageScore:
        thisWeekAttempts.length > 0
          ? Math.round(
              thisWeekAttempts.reduce((sum, a) => sum + a.percentage, 0) /
                thisWeekAttempts.length
            )
          : 0,
      timeSpent: thisWeekAttempts.reduce(
        (sum, a) => sum + (a.timeSpent || 0),
        0
      ),
    };

    // Check for new achievements
    const achievements = await checkForNewAchievements(user, thisWeekStats);

    // Get study recommendations based on weak topics
    const weakTopics = user.quizHistory
      .slice(-3)
      .flatMap((quiz) => quiz.weakTopics || [])
      .reduce((acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
      }, {});

    const topWeakTopics = Object.entries(weakTopics)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);

    res.json({
      user,
      recentAttempts,
      thisWeekStats,
      achievements,
      topWeakTopics,
      studyStreak: user.studyStreak,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   POST /api/user/achievement
// @desc    Award an achievement to user
// @access  Private
router.post("/achievement", auth, async (req, res) => {
  try {
    const { title, description, icon } = req.body;

    const user = await User.findById(req.user._id);

    // Check if user already has this achievement
    const hasAchievement = user.achievements.some((ach) => ach.title === title);
    if (hasAchievement) {
      return res.status(400).json({ error: "Achievement already earned" });
    }

    user.achievements.push({
      title,
      description,
      icon,
      earnedAt: new Date(),
    });

    await user.save();

    res.json({
      message: "Achievement earned!",
      achievement: user.achievements[user.achievements.length - 1],
    });
  } catch (error) {
    console.error("Achievement error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /api/user/leaderboard
// @desc    Get leaderboard data
// @access  Private
router.get("/leaderboard", auth, async (req, res) => {
  try {
    const timeframe = req.query.timeframe || "all"; // all, week, month

    let dateFilter = {};
    if (timeframe === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { updatedAt: { $gte: weekAgo } };
    } else if (timeframe === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { updatedAt: { $gte: monthAgo } };
    }

    // Get top performers based on average score and total quizzes
    const topUsers = await User.aggregate([
      { $match: dateFilter },
      {
        $addFields: {
          avgScore: {
            $cond: {
              if: { $eq: [{ $size: "$quizHistory" }, 0] },
              then: 0,
              else: { $avg: "$quizHistory.score" },
            },
          },
          totalQuizzes: { $size: "$quizHistory" },
        },
      },
      {
        $match: {
          totalQuizzes: { $gte: 1 },
        },
      },
      {
        $sort: {
          avgScore: -1,
          totalQuizzes: -1,
          "studyStreak.current": -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          name: 1,
          grade: 1,
          school: 1,
          avgScore: 1,
          totalQuizzes: 1,
          studyStreak: "$studyStreak.current",
        },
      },
    ]);

    // Find current user's rank
    const allUsers = await User.aggregate([
      { $match: dateFilter },
      {
        $addFields: {
          avgScore: {
            $cond: {
              if: { $eq: [{ $size: "$quizHistory" }, 0] },
              then: 0,
              else: { $avg: "$quizHistory.score" },
            },
          },
          totalQuizzes: { $size: "$quizHistory" },
        },
      },
      {
        $match: {
          totalQuizzes: { $gte: 1 },
        },
      },
      {
        $sort: {
          avgScore: -1,
          totalQuizzes: -1,
          "studyStreak.current": -1,
        },
      },
    ]);

    const currentUserRank =
      allUsers.findIndex(
        (user) => user._id.toString() === req.user._id.toString()
      ) + 1;

    res.json({
      topUsers,
      currentUserRank: currentUserRank || null,
      totalParticipants: allUsers.length,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /api/user/analytics
// @desc    Get detailed user analytics
// @access  Private
router.get("/analytics", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    // Get all quiz attempts for detailed analysis
    const attempts = await QuizAttempt.find({ userId: req.user._id })
      .populate("quizId", "subject difficulty")
      .sort({ completedAt: -1 });

    // Performance over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAttempts = attempts.filter(
      (a) => a.completedAt >= thirtyDaysAgo
    );

    const dailyPerformance = {};
    recentAttempts.forEach((attempt) => {
      const date = attempt.completedAt.toISOString().split("T")[0];
      if (!dailyPerformance[date]) {
        dailyPerformance[date] = { scores: [], count: 0 };
      }
      dailyPerformance[date].scores.push(attempt.percentage);
      dailyPerformance[date].count++;
    });

    // Convert to array format for charts
    const performanceChart = Object.entries(dailyPerformance)
      .map(([date, data]) => ({
        date,
        averageScore: Math.round(
          data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        ),
        quizCount: data.count,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Subject performance
    const subjectPerformance = {};
    attempts.forEach((attempt) => {
      const subject = attempt.quizId.subject;
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = {
          attempts: 0,
          totalScore: 0,
          averageScore: 0,
          bestScore: 0,
          improvement: 0,
        };
      }

      const sp = subjectPerformance[subject];
      sp.attempts++;
      sp.totalScore += attempt.percentage;
      sp.averageScore = Math.round(sp.totalScore / sp.attempts);
      sp.bestScore = Math.max(sp.bestScore, attempt.percentage);
    });

    // Calculate improvement for each subject (compare first vs last 3 attempts)
    Object.keys(subjectPerformance).forEach((subject) => {
      const subjectAttempts = attempts
        .filter((a) => a.quizId.subject === subject)
        .sort((a, b) => a.completedAt - b.completedAt);

      if (subjectAttempts.length >= 4) {
        const firstThree = subjectAttempts.slice(0, 3);
        const lastThree = subjectAttempts.slice(-3);

        const firstAvg =
          firstThree.reduce((sum, a) => sum + a.percentage, 0) / 3;
        const lastAvg = lastThree.reduce((sum, a) => sum + a.percentage, 0) / 3;

        subjectPerformance[subject].improvement = Math.round(
          lastAvg - firstAvg
        );
      }
    });

    // Difficulty progression
    const difficultyStats = {
      easy: { attempts: 0, avgScore: 0, totalScore: 0 },
      medium: { attempts: 0, avgScore: 0, totalScore: 0 },
      hard: { attempts: 0, avgScore: 0, totalScore: 0 },
    };

    attempts.forEach((attempt) => {
      const diff = attempt.quizId.difficulty || "medium";
      if (difficultyStats[diff]) {
        difficultyStats[diff].attempts++;
        difficultyStats[diff].totalScore += attempt.percentage;
      }
    });

    Object.keys(difficultyStats).forEach((diff) => {
      if (difficultyStats[diff].attempts > 0) {
        difficultyStats[diff].avgScore = Math.round(
          difficultyStats[diff].totalScore / difficultyStats[diff].attempts
        );
      }
      delete difficultyStats[diff].totalScore;
    });

    res.json({
      user: {
        name: user.name,
        grade: user.grade,
        totalQuizzes: user.totalQuizzes,
        averageScore: user.averageScore,
        studyStreak: user.studyStreak,
      },
      performanceChart,
      subjectPerformance,
      difficultyStats,
      recentTrend: calculateRecentTrend(attempts.slice(0, 10)),
      insights: generateInsights(attempts, user),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Helper function to check for new achievements
async function checkForNewAchievements(user, weekStats) {
  const newAchievements = [];

  const achievementRules = [
    {
      title: "First Quiz",
      description: "Completed your first quiz!",
      icon: "🎯",
      condition: () => user.totalQuizzes === 1,
    },
    {
      title: "Quiz Master",
      description: "Completed 10 quizzes!",
      icon: "🏆",
      condition: () => user.totalQuizzes === 10,
    },
    {
      title: "Perfect Score",
      description: "Scored 100% on a quiz!",
      icon: "⭐",
      condition: () =>
        user.quizHistory.some((q) => q.score / q.totalQuestions === 1),
    },
    {
      title: "Study Streak",
      description: "Maintained a 7-day study streak!",
      icon: "🔥",
      condition: () => user.studyStreak.current >= 7,
    },
    {
      title: "High Achiever",
      description: "Maintained 90%+ average score!",
      icon: "🌟",
      condition: () => user.averageScore >= 90 && user.totalQuizzes >= 5,
    },
  ];

  for (const rule of achievementRules) {
    const hasAchievement = user.achievements.some(
      (ach) => ach.title === rule.title
    );
    if (!hasAchievement && rule.condition()) {
      newAchievements.push({
        title: rule.title,
        description: rule.description,
        icon: rule.icon,
      });
    }
  }

  return newAchievements;
}

// Helper function to calculate recent trend
function calculateRecentTrend(recentAttempts) {
  if (recentAttempts.length < 3) return "insufficient_data";

  const scores = recentAttempts
    .slice(0, 5)
    .map((a) => a.percentage)
    .reverse();
  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const difference = secondAvg - firstAvg;

  if (difference > 5) return "improving";
  if (difference < -5) return "declining";
  return "stable";
}

// Helper function to generate insights
function generateInsights(attempts, user) {
  const insights = [];

  if (attempts.length === 0) {
    insights.push("Take your first quiz to start tracking your progress!");
    return insights;
  }

  // Study frequency insight
  if (user.studyStreak.current >= 7) {
    insights.push(
      `Great job! You've maintained a ${user.studyStreak.current}-day study streak. Keep it up!`
    );
  } else if (attempts.length >= 5) {
    const daysSinceLastQuiz = Math.floor(
      (new Date() - attempts[0].completedAt) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastQuiz > 3) {
      insights.push(
        "You haven't taken a quiz in a while. Regular practice helps maintain your skills!"
      );
    }
  }

  // Performance insight
  if (user.averageScore >= 85) {
    insights.push(
      "Excellent performance! You're consistently scoring above 85%."
    );
  } else if (user.averageScore >= 70) {
    insights.push(
      "Good work! You're maintaining solid performance. Try challenging yourself with harder questions."
    );
  } else {
    insights.push(
      "Keep practicing! Focus on your weak areas to improve your scores."
    );
  }

  // Subject variety insight
  const subjects = [...new Set(attempts.map((a) => a.quizId.subject))];
  if (subjects.length === 1 && attempts.length >= 5) {
    insights.push(
      "Consider diversifying your study topics to build a broader knowledge base."
    );
  } else if (subjects.length >= 3) {
    insights.push(
      "Great job studying multiple subjects! Variety helps reinforce learning."
    );
  }

  return insights;
}

module.exports = router;
