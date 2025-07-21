const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    grade: {
      type: String,
      required: [true, "Grade level is required"],
      enum: ["9th", "10th", "11th", "12th"],
    },
    school: {
      type: String,
      trim: true,
      maxlength: [100, "School name cannot be more than 100 characters"],
    },
    quizHistory: [
      {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        score: Number,
        totalQuestions: Number,
        completedAt: { type: Date, default: Date.now },
        timeSpent: Number, // in seconds
        weakTopics: [String],
      },
    ],
    studyStreak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastStudyDate: Date,
    },
    preferences: {
      difficultylevel: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
      },
      questionTypes: [
        {
          type: String,
          enum: ["mcq", "short", "fillblank"],
          default: ["mcq", "short"],
        },
      ],
      studyReminders: { type: Boolean, default: false },
    },
    achievements: [
      {
        title: String,
        description: String,
        earnedAt: { type: Date, default: Date.now },
        icon: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update study streak
userSchema.methods.updateStudyStreak = function () {
  const today = new Date().toDateString();
  const lastStudy = this.studyStreak.lastStudyDate
    ? this.studyStreak.lastStudyDate.toDateString()
    : null;

  if (lastStudy === today) {
    // Already studied today
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastStudy === yesterday.toDateString()) {
    // Continuing streak
    this.studyStreak.current += 1;
  } else {
    // Starting new streak
    this.studyStreak.current = 1;
  }

  if (this.studyStreak.current > this.studyStreak.longest) {
    this.studyStreak.longest = this.studyStreak.current;
  }

  this.studyStreak.lastStudyDate = new Date();
};

// Virtual for user's average score
userSchema.virtual("averageScore").get(function () {
  if (!this.quizHistory.length) return 0;

  const totalScore = this.quizHistory.reduce((sum, quiz) => {
    return sum + (quiz.score / quiz.totalQuestions) * 100;
  }, 0);

  return Math.round(totalScore / this.quizHistory.length);
});

// Virtual for total quizzes taken
userSchema.virtual("totalQuizzes").get(function () {
  return this.quizHistory.length;
});

userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
