const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["mcq", "short", "fillblank"],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
    },
  ], // Only for MCQ questions
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: String,
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  topic: String,
  keywords: [String], // For better evaluation of short answers
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow null for demo/anonymous quizzes
    },
    subject: {
      type: String,
      required: true,
    },
    sourceContent: {
      type: String,
      required: true, // The original notes/syllabus content
    },
    questions: [questionSchema],
    settings: {
      timeLimit: { type: Number, default: null }, // in minutes
      randomizeQuestions: { type: Boolean, default: true },
      showResultsImmediately: { type: Boolean, default: true },
      allowRetake: { type: Boolean, default: true },
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "adaptive"],
      default: "medium",
    },
    tags: [String],
    isPublic: {
      type: Boolean,
      default: false,
    },
    analytics: {
      totalAttempts: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      averageTimeSpent: { type: Number, default: 0 },
      commonWrongAnswers: [
        {
          questionId: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String for practice quizzes
          wrongAnswer: String,
          count: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String for practice quizzes
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answers: [
    {
      questionId: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String for practice quizzes
      userAnswer: String,
      isCorrect: Boolean,
      timeSpent: Number, // seconds spent on this question
      difficulty: String, // question difficulty when answered
    },
  ],
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  timeSpent: Number, // total time in seconds
  completedAt: {
    type: Date,
    default: Date.now,
  },
  // Fields for practice quizzes (when quizId is string)
  subject: String, // Store subject directly for practice quizzes
  difficulty: String, // Store difficulty for practice quizzes
  quizTitle: String, // Store title for practice quizzes
  isPracticeQuiz: { type: Boolean, default: false }, // Flag to identify practice quizzes
  feedback: {
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    nextSteps: String,
  },
  adaptiveData: {
    initialDifficulty: String,
    finalDifficulty: String,
    difficultyAdjustments: [
      {
        questionIndex: Number,
        fromDifficulty: String,
        toDifficulty: String,
        reason: String,
      },
    ],
  },
});

// Calculate percentage score
quizAttemptSchema.virtual("percentage").get(function () {
  return Math.round((this.score / this.totalQuestions) * 100);
});

// Get weak topics based on wrong answers
quizAttemptSchema.methods.getWeakTopics = function () {
  const wrongAnswers = this.answers.filter((answer) => !answer.isCorrect);
  // This would be populated with actual topic data from the quiz
  return wrongAnswers.map((answer) => answer.topic).filter(Boolean);
};

quizAttemptSchema.set("toJSON", { virtuals: true });

const Quiz = mongoose.model("Quiz", quizSchema);
const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

module.exports = { Quiz, QuizAttempt };
