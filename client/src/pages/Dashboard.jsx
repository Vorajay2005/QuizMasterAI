import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Brain,
  Trophy,
  Clock,
  TrendingUp,
  BookOpen,
  Target,
  Flame,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

import useAuthStore from "../store/authStore";
import useQuizStore from "../store/quizStore";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  formatDate,
  getScoreColor,
  getGrade,
  getTopicIcon,
} from "../utils/helpers";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuthStore();
  const { getUserAttempts, getUserStats } = useQuizStore();
  const navigate = useNavigate();

  const generateAchievements = (stats, user) => {
    const achievements = [];

    if (stats?.totalQuizzes >= 1) {
      achievements.push({
        title: "First Steps",
        description: "Completed your first quiz!",
        icon: "🎯",
      });
    }

    if (stats?.totalQuizzes >= 5) {
      achievements.push({
        title: "Getting Started",
        description: "Completed 5 quizzes!",
        icon: "📚",
      });
    }

    if (stats?.totalQuizzes >= 10) {
      achievements.push({
        title: "Quiz Master",
        description: "Completed 10 quizzes!",
        icon: "🏆",
      });
    }

    if (stats?.averageScore >= 80) {
      achievements.push({
        title: "High Achiever",
        description: "Maintaining 80%+ average!",
        icon: "⭐",
      });
    }

    if (user?.studyStreak?.current >= 3) {
      achievements.push({
        title: "Study Streak",
        description: `${user.studyStreak.current}-day learning streak!`,
        icon: "🔥",
      });
    }

    return achievements.slice(0, 3); // Show max 3 achievements
  };

  const refreshDashboard = async () => {
    setIsLoading(true);
    try {
      // Load user stats and recent attempts
      const [statsResult, attemptsResult] = await Promise.all([
        getUserStats(),
        getUserAttempts(1, 5),
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      if (attemptsResult.success) {
        setRecentAttempts(attemptsResult.data.attempts);
      }

      // Update dashboard data
      setDashboardData({
        thisWeekStats: {
          quizzesTaken: statsResult.data?.totalQuizzes || 0,
          averageScore: statsResult.data?.averageScore || 0,
          timeSpent: Math.floor((statsResult.data?.totalTimeSpent || 0) / 60),
        },
        achievements: generateAchievements(statsResult.data, user),
        topWeakTopics: statsResult.data?.weakTopics || [],
      });

      toast.success("Dashboard updated!");
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
      toast.error("Failed to refresh dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        // Load user stats and recent attempts
        const [statsResult, attemptsResult] = await Promise.all([
          getUserStats(),
          getUserAttempts(1, 5),
        ]);

        if (statsResult.success) {
          setStats(statsResult.data);
        }

        if (attemptsResult.success) {
          setRecentAttempts(attemptsResult.data.attempts);
        }

        // Dynamic dashboard data based on user stats
        setDashboardData({
          thisWeekStats: {
            quizzesTaken: statsResult.data?.totalQuizzes || 0,
            averageScore: statsResult.data?.averageScore || 0,
            timeSpent: Math.floor((statsResult.data?.totalTimeSpent || 0) / 60), // convert to minutes
          },
          achievements: generateAchievements(statsResult.data, user),
          topWeakTopics: statsResult.data?.weakTopics || [],
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();

    // Set up periodic refresh to catch updates from quiz completions
    const refreshInterval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds

    // Listen for storage events to catch updates from other tabs
    const handleStorageChange = (e) => {
      if (e.key === "quiz-completed") {
        console.log("Quiz completed in another tab, refreshing dashboard...");
        loadDashboardData();
        // Clear the trigger
        localStorage.removeItem("quiz-completed");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events within the same tab
    const handleQuizCompleted = () => {
      console.log("Quiz completed, refreshing dashboard...");
      loadDashboardData();
    };

    window.addEventListener("quiz-completed", handleQuizCompleted);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("quiz-completed", handleQuizCompleted);
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  // Get progress data from user stats or use default
  const getProgressData = () => {
    if (stats?.recentProgress && stats.recentProgress.length > 0) {
      return stats.recentProgress.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        score: item.score,
        subject: item.subject,
      }));
    }

    // Default data for new users
    return [{ date: "Start", score: 0 }];
  };

  const progressData = getProgressData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="section-padding">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 font-display mb-2">
                Welcome back, {user?.name?.split(" ")[0]}! 👋
              </h1>
              <p className="text-gray-600">
                Ready to continue your learning journey?
              </p>
            </div>
            <Button
              onClick={refreshDashboard}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <TrendingUp size={16} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Link
            to="/create-quiz"
            className="card card-hover bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-8 text-center"
          >
            <Plus size={32} className="mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Create New Quiz</h3>
            <p className="text-white/80">
              Turn your notes into a quiz instantly
            </p>
          </Link>

          <Link to="/browse" className="card card-hover p-8 text-center">
            <BookOpen size={32} className="mx-auto mb-4 text-primary-600" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Browse Quizzes
            </h3>
            <p className="text-gray-600">Explore community quizzes</p>
          </Link>

          <Link to="/analytics" className="card card-hover p-8 text-center">
            <BarChart3 size={32} className="mx-auto mb-4 text-secondary-600" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              View Analytics
            </h3>
            <p className="text-gray-600">Track your progress in detail</p>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="card text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Trophy size={24} className="text-primary-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats?.totalQuizzes || 0}
                </div>
                <div className="text-gray-600 text-sm">Quizzes Completed</div>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target size={24} className="text-success-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats?.averageScore || 0}%
                </div>
                <div className="text-gray-600 text-sm">Average Score</div>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Flame size={24} className="text-warning-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {user?.studyStreak?.current || 0}
                </div>
                <div className="text-gray-600 text-sm">Day Streak</div>
              </div>
            </motion.div>

            {/* Progress Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                This Week's Progress
              </h3>
              <div className="h-64">
                {progressData.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value}%`,
                          `Score${
                            props.payload.subject
                              ? ` (${props.payload.subject})`
                              : ""
                          }`,
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        dot={{ fill: "#0ea5e9", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <BarChart3
                        size={48}
                        className="mx-auto mb-4 opacity-50"
                      />
                      <p>Complete more quizzes to see your progress chart</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Recent Quiz Attempts
                </h3>
                <Link
                  to="/analytics"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {recentAttempts.length > 0 ? (
                  recentAttempts.map((attempt) => (
                    <div
                      key={attempt._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-lg">
                          {getTopicIcon(attempt.quizId?.subject)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {attempt.quizId?.title || "Quiz"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(attempt.completedAt)} •{" "}
                            <span className="font-medium text-blue-600">
                              {attempt.quizId?.subject}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-semibold ${getScoreColor(
                            attempt.percentage
                          )}`}
                        >
                          {attempt.percentage}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {getGrade(attempt.percentage, attempt.totalQuestions)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen
                      size={48}
                      className="mx-auto text-gray-400 mb-4"
                    />
                    <p className="text-gray-600 mb-4">No quiz attempts yet</p>
                    <Button onClick={() => navigate("/create-quiz")}>
                      Create Your First Quiz
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Achievements
              </h3>
              <div className="space-y-3">
                {dashboardData?.achievements?.map((achievement, index) => (
                  <motion.div
                    key={achievement.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg"
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {achievement.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Study Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Areas to Focus
              </h3>
              <div className="space-y-2">
                {dashboardData?.topWeakTopics?.map((topic, index) => (
                  <div
                    key={topic}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                  >
                    <span className="text-gray-900 font-medium">{topic}</span>
                    <span className="badge badge-warning">Review</span>
                  </div>
                )) || (
                  <p className="text-gray-600 text-center py-4">
                    Complete more quizzes to get personalized recommendations
                  </p>
                )}
              </div>
            </motion.div>

            {/* Study Streak */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="card bg-gradient-to-r from-orange-100 to-red-100 border-orange-200"
            >
              <div className="text-center">
                <Flame size={32} className="mx-auto text-orange-600 mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">
                  {user?.studyStreak?.current || 0} Day Streak
                </h3>
                <p className="text-gray-600 mt-1">Keep the momentum going!</p>
                {user?.studyStreak?.longest > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Best: {user.studyStreak.longest} days
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
