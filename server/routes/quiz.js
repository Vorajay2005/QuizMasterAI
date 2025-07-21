const express = require("express");
const Joi = require("joi");
const { Quiz, QuizAttempt } = require("../models/Quiz");
const User = require("../models/User");
const { auth, optionalAuth } = require("../middleware/auth");
const openaiService = require("../services/openaiService");

// Demo quiz data for submission testing
const demoQuizzes = [
  {
    _id: "demo-1",
    title: "Biology Chapter 12: Photosynthesis",
    subject: "Biology",
    questions: [
      {
        _id: "q1",
        type: "mcq",
        question: "What is the primary pigment involved in photosynthesis?",
        options: ["Chlorophyll", "Carotene", "Anthocyanin", "Xanthophyll"],
        correctAnswer: "Chlorophyll",
      },
    ],
  },
  {
    _id: "demo-2",
    title: "Calculus Fundamentals: Derivatives",
    subject: "Mathematics",
    questions: [
      {
        _id: "calc1",
        type: "mcq",
        question: "What is the derivative of x²?",
        options: ["x", "2x", "x²", "2x²"],
        correctAnswer: "2x",
      },
      {
        _id: "calc2",
        type: "mcq",
        question:
          "The fundamental theorem of calculus connects which two concepts?",
        options: [
          "Limits and continuity",
          "Derivatives and integrals",
          "Functions and graphs",
          "Sequences and series",
        ],
        correctAnswer: "Derivatives and integrals",
      },
      {
        _id: "calc3",
        type: "short",
        question: "What does the derivative of a function represent?",
        correctAnswer:
          "The rate of change or slope of the function at any given point.",
      },
    ],
  },
  {
    _id: "demo-3",
    title: "Chemistry: Chemical Bonds",
    subject: "Chemistry",
    questions: [
      {
        _id: "chem1",
        type: "mcq",
        question: "What type of bond forms between a metal and a non-metal?",
        options: [
          "Covalent bond",
          "Ionic bond",
          "Metallic bond",
          "Hydrogen bond",
        ],
        correctAnswer: "Ionic bond",
      },
    ],
  },
  {
    _id: "demo-4",
    title: "General Studies Quiz",
    subject: "General",
    questions: [
      {
        _id: "gen1",
        type: "mcq",
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: "Paris",
      },
    ],
  },
];

const router = express.Router();

// Validation schemas
const createQuizSchema = Joi.object({
  title: Joi.string().max(100).optional(),
  subject: Joi.string().max(50).required(),
  content: Joi.string().min(50).required(),
  difficulty: Joi.string()
    .valid("easy", "medium", "hard", "adaptive")
    .default("medium"),
  questionCount: Joi.number().min(5).max(20).default(10),
  questionTypes: Joi.array()
    .items(Joi.string().valid("mcq", "short", "fillblank"))
    .default(["mcq", "short"]),
  timeLimit: Joi.number().min(5).max(120).optional(),
  isPublic: Joi.boolean().default(false),
});

const submitAnswersSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        answer: Joi.string().required(),
        timeSpent: Joi.number().min(0).optional(),
      })
    )
    .required(),
  timeSpent: Joi.number().min(0).required(),
});

// @route   POST /api/quiz/test-demo
// @desc    Test demo quiz generation (no auth required)
// @access  Public
router.post("/test-demo", async (req, res) => {
  try {
    console.log("🧪 Testing demo quiz generation...");

    const demoQuiz = await openaiService.generateQuiz(
      "Biology content about photosynthesis and cells",
      {
        difficulty: "medium",
        questionCount: 5,
        questionTypes: ["mcq", "short"],
        subject: "Biology",
      }
    );

    console.log("✅ Demo quiz generated successfully:", demoQuiz);
    res.json({ success: true, quiz: demoQuiz });
  } catch (error) {
    console.error("❌ Demo quiz generation failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/quiz/generate
// @desc    Generate a quiz from content using AI
// @access  Private (or Public for demo mode)
router.post("/generate", optionalAuth, async (req, res) => {
  try {
    const { error, value } = createQuizSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      title,
      subject,
      content,
      difficulty,
      questionCount,
      questionTypes,
      timeLimit,
      isPublic,
    } = value;

    // Auto-detect specific topic from content (optional - don't let this break quiz generation)
    let detectedTopic = subject;
    try {
      // Use demo topic detection to avoid OpenAI calls that may hang
      const topicResult = openaiService.detectTopicDemo(content);
      if (topicResult && topicResult.trim()) {
        detectedTopic = topicResult;
      }
    } catch (error) {
      console.log(
        "Topic detection failed, using provided subject:",
        error.message
      );
      // Continue with provided subject
    }

    // Generate quiz using OpenAI (with fallback for demo mode)
    let aiQuizData;
    try {
      aiQuizData = await openaiService.generateQuiz(content, {
        difficulty,
        questionCount,
        questionTypes,
        subject: detectedTopic,
      });
    } catch (error) {
      console.error("AI quiz generation failed:", error.message);

      // Fallback to demo quiz generation
      console.log("Falling back to demo quiz generation...");
      aiQuizData = openaiService.generateDemoQuiz(
        detectedTopic || subject,
        questionCount,
        questionTypes,
        difficulty
      );
    }

    // For demo mode - if user is not logged in, just return the quiz data without saving
    if (!req.user) {
      return res.json({
        success: true,
        message: "Demo quiz generated successfully! Sign up to save quizzes.",
        quiz: {
          title: title || aiQuizData.title || `${detectedTopic} Quiz`,
          description: `AI-generated quiz covering ${detectedTopic} concepts`,
          subject: detectedTopic || subject,
          questions: aiQuizData.questions,
          difficulty: aiQuizData.difficulty || difficulty,
          settings: {
            timeLimit,
            randomizeQuestions: true,
            showResultsImmediately: true,
            allowRetake: true,
          },
          isDemo: true,
        },
      });
    }

    // Create quiz in database (for logged-in users)
    const quiz = new Quiz({
      title: title || aiQuizData.title || `${detectedTopic} Quiz`,
      description: `AI-generated quiz covering ${detectedTopic} concepts`,
      createdBy: req.user._id,
      subject: detectedTopic || subject,
      sourceContent: content,
      questions: aiQuizData.questions,
      difficulty: aiQuizData.difficulty || difficulty,
      settings: {
        timeLimit,
        randomizeQuestions: true,
        showResultsImmediately: true,
        allowRetake: true,
      },
      isPublic,
    });

    const savedQuiz = await quiz.save();

    // Populate creator info for response
    await savedQuiz.populate("createdBy", "name email");

    res.status(201).json({
      message: "Quiz generated successfully!",
      quiz: savedQuiz,
    });
  } catch (error) {
    console.error("Quiz generation error:", error);

    // Try to provide a fallback quiz even if there's an error
    try {
      console.log("Attempting emergency fallback quiz generation...");
      const fallbackQuiz = openaiService.generateDemoQuiz(
        subject,
        Math.min(questionCount || 5, 10),
        questionTypes || ["mcq"],
        difficulty || "medium"
      );

      if (!req.user) {
        return res.json({
          success: true,
          message:
            "Fallback quiz generated successfully! Sign up to save quizzes.",
          quiz: {
            ...fallbackQuiz,
            title: title || `${subject} Practice Quiz`,
            description: `Sample quiz covering ${subject} concepts`,
            subject,
            settings: {
              timeLimit: timeLimit || 30,
              randomizeQuestions: true,
              showResultsImmediately: true,
              allowRetake: true,
            },
            isDemo: true,
          },
        });
      }

      // For logged-in users, save the fallback quiz
      const quiz = new Quiz({
        title: title || fallbackQuiz.title || `${subject} Practice Quiz`,
        description: `Sample quiz covering ${subject} concepts`,
        createdBy: req.user._id,
        subject,
        sourceContent: content,
        questions: fallbackQuiz.questions,
        difficulty: fallbackQuiz.difficulty || difficulty,
        settings: {
          timeLimit: timeLimit || 30,
          randomizeQuestions: true,
          showResultsImmediately: true,
          allowRetake: true,
        },
        isPublic: isPublic || false,
      });

      const savedQuiz = await quiz.save();
      await savedQuiz.populate("createdBy", "name email");

      res.status(201).json({
        message: "Fallback quiz generated successfully!",
        quiz: savedQuiz,
        warning: "AI generation unavailable, using sample questions",
      });
    } catch (fallbackError) {
      console.error("Fallback quiz generation also failed:", fallbackError);

      if (
        error.message.includes("OpenAI") ||
        error.message.includes("Failed to generate")
      ) {
        res.status(503).json({
          error:
            "Quiz generation service is temporarily unavailable. Please try again later.",
          details: error.message,
        });
      } else {
        res.status(500).json({
          error: "Server error during quiz generation",
          details: error.message,
        });
      }
    }
  }
});

// @route   GET /api/quiz/:id
// @desc    Get a quiz by ID
// @access  Public (with optional auth for personalization)
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(
      "createdBy",
      "name"
    );

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Check if quiz is private and user has access
    if (
      !quiz.isPublic &&
      (!req.user || quiz.createdBy._id.toString() !== req.user._id.toString())
    ) {
      return res
        .status(403)
        .json({ error: "Access denied to this private quiz" });
    }

    // For quiz taking, don't send correct answers and explanations
    const quizForTaking = {
      ...quiz.toObject(),
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        type: q.type,
        question: q.question,
        options: q.options,
        topic: q.topic,
        difficulty: q.difficulty,
      })),
    };

    res.json({ quiz: quizForTaking });
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   POST /api/quiz/:id/submit
// @desc    Submit quiz answers for evaluation
// @access  Private (or Public for demo mode)
router.post("/:id/submit", optionalAuth, async (req, res) => {
  try {
    const { error, value } = submitAnswersSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { answers, timeSpent } = value;
    const quizId = req.params.id;

    // Handle demo quiz submission
    if (quizId.startsWith("demo-") || !req.user) {
      console.log("🧪 Demo quiz submission:", quizId);
      console.log(
        "📊 Available demo quizzes:",
        demoQuizzes.map((q) => q._id)
      );

      const demoQuiz = demoQuizzes.find((q) => q._id === quizId);
      if (!demoQuiz) {
        console.log("❌ Demo quiz not found:", quizId);
        return res.status(404).json({ error: "Demo quiz not found" });
      }

      console.log("✅ Found demo quiz:", demoQuiz.title);

      // Evaluate answers using demo quiz data
      let evaluation;
      try {
        evaluation = await openaiService.evaluateAnswers(
          demoQuiz.questions,
          answers
        );
      } catch (error) {
        console.log("⚠️ AI evaluation failed, using fallback:", error.message);
        // Fallback evaluation for demo mode
        evaluation = {
          totalScore: Math.floor(Math.random() * demoQuiz.questions.length) + 1,
          overallFeedback: "Great job completing the demo quiz!",
          strengths: ["Good understanding of the concepts"],
          weaknesses: [],
          recommendations: ["Keep practicing to improve further!"],
        };
      }

      // Return demo results without saving to database
      return res.json({
        message: "Demo quiz completed! Sign up to track your progress.",
        attempt: {
          quizId: demoQuiz._id,
          score: evaluation.totalScore || 0,
          totalQuestions: demoQuiz.questions.length,
          timeSpent,
          percentage: Math.round(
            ((evaluation.totalScore || 0) / demoQuiz.questions.length) * 100
          ),
          feedback: evaluation.overallFeedback,
        },
        evaluation,
        personalizedFeedback: {
          strengths: evaluation.strengths || ["Great job attempting the quiz!"],
          weaknesses: evaluation.weaknesses || [],
          recommendations: evaluation.recommendations || [
            "Keep practicing to improve!",
          ],
        },
        isDemo: true,
      });
    }

    // Get the quiz with correct answers (for registered users)
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Evaluate answers using AI
    const evaluation = await openaiService.evaluateAnswers(
      quiz.questions,
      answers
    );

    // Create quiz attempt record
    const attempt = new QuizAttempt({
      quizId: quiz._id,
      userId: req.user._id,
      answers: answers.map((ans, index) => {
        const question = quiz.questions[index];
        const result = evaluation.results.find(
          (r) => r.questionId === question._id.toString()
        );

        return {
          questionId: question._id,
          userAnswer: ans.answer,
          isCorrect: result?.isCorrect || false,
          timeSpent: ans.timeSpent || 0,
          difficulty: question.difficulty,
        };
      }),
      score: evaluation.totalScore || 0,
      totalQuestions: quiz.questions.length,
      timeSpent,
      feedback: evaluation.overallFeedback,
    });

    await attempt.save();

    // Update user's quiz history
    const user = await User.findById(req.user._id);
    user.quizHistory.push({
      quizId: quiz._id,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      completedAt: attempt.completedAt,
      timeSpent: attempt.timeSpent,
      weakTopics: evaluation.overallFeedback.weakTopics,
    });

    // Update study streak
    user.updateStudyStreak();
    await user.save();

    // Update quiz analytics
    quiz.analytics.totalAttempts += 1;
    const currentAvg = quiz.analytics.averageScore;
    const totalAttempts = quiz.analytics.totalAttempts;
    quiz.analytics.averageScore =
      (currentAvg * (totalAttempts - 1) + evaluation.percentage) /
      totalAttempts;

    await quiz.save();

    // Generate personalized recommendations
    let personalizedFeedback = {};
    try {
      personalizedFeedback = await openaiService.generatePersonalizedFeedback(
        {
          averageScore: user.averageScore,
          totalQuizzes: user.totalQuizzes,
          studyStreak: user.studyStreak.current,
        },
        {
          percentage: evaluation.percentage,
          weakTopics: evaluation.overallFeedback.weakTopics,
          subject: quiz.subject,
        }
      );
    } catch (err) {
      console.error("Failed to generate personalized feedback:", err);
    }

    res.json({
      message: "Quiz submitted successfully!",
      attempt,
      evaluation,
      personalizedFeedback,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    res.status(500).json({ error: "Server error during quiz submission" });
  }
});

// @route   GET /api/quiz/user/attempts
// @desc    Get user's quiz attempts
// @access  Private
router.get("/user/attempts", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const attempts = await QuizAttempt.find({ userId: req.user._id })
      .populate("quizId", "title subject difficulty")
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await QuizAttempt.countDocuments({ userId: req.user._id });

    res.json({
      attempts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get attempts error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /api/quiz/user/stats
// @desc    Get user's quiz statistics
// @access  Private
router.get("/user/stats", auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id }).populate(
      "quizId",
      "subject"
    );

    const stats = {
      totalQuizzes: attempts.length,
      averageScore: 0,
      totalTimeSpent: 0,
      subjectBreakdown: {},
      difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
      recentProgress: [],
      weakTopics: [],
    };

    if (attempts.length > 0) {
      stats.averageScore = Math.round(
        attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
          attempts.length
      );

      stats.totalTimeSpent = attempts.reduce(
        (sum, attempt) => sum + (attempt.timeSpent || 0),
        0
      );

      // Subject breakdown
      attempts.forEach((attempt) => {
        const subject = attempt.quizId.subject;
        if (!stats.subjectBreakdown[subject]) {
          stats.subjectBreakdown[subject] = {
            count: 0,
            avgScore: 0,
            totalScore: 0,
          };
        }
        stats.subjectBreakdown[subject].count++;
        stats.subjectBreakdown[subject].totalScore += attempt.percentage;
      });

      // Calculate average scores for subjects
      Object.keys(stats.subjectBreakdown).forEach((subject) => {
        const subjectData = stats.subjectBreakdown[subject];
        subjectData.avgScore = Math.round(
          subjectData.totalScore / subjectData.count
        );
        delete subjectData.totalScore;
      });

      // Recent progress (last 10 attempts)
      stats.recentProgress = attempts
        .slice(0, 10)
        .reverse()
        .map((attempt) => ({
          date: attempt.completedAt,
          score: attempt.percentage,
          subject: attempt.quizId.subject,
        }));

      // Collect weak topics from recent attempts
      const recentWeakTopics = attempts
        .slice(0, 5)
        .flatMap((attempt) => attempt.feedback?.weaknesses || []);

      stats.weakTopics = [...new Set(recentWeakTopics)].slice(0, 5);
    }

    res.json(stats);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /api/quiz/public
// @desc    Get public quizzes
// @access  Public
router.get("/public/list", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const subject = req.query.subject;

    const filter = { isPublic: true };
    if (subject) {
      filter.subject = { $regex: subject, $options: "i" };
    }

    const quizzes = await Quiz.find(filter)
      .select(
        "title subject difficulty createdAt analytics.totalAttempts analytics.averageScore"
      )
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Quiz.countDocuments(filter);

    res.json({
      quizzes,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get public quizzes error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   DELETE /api/quiz/:id
// @desc    Delete a quiz (only creator can delete)
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this quiz" });
    }

    await Quiz.findByIdAndDelete(req.params.id);
    await QuizAttempt.deleteMany({ quizId: req.params.id });

    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
