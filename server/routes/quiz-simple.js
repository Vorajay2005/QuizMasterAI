const express = require("express");
const Joi = require("joi");
const { optionalAuth } = require("../middleware/auth");
const openaiService = require("../services/openaiService");

const router = express.Router();

// Simple validation schema
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

// @route   POST /api/quiz-simple/generate
// @desc    Generate a quiz from content using AI (simplified version)
// @access  Public
router.post("/generate", async (req, res) => {
  console.log("🎯 Quiz generation request received");

  try {
    // Validate input
    const { error, value } = createQuizSchema.validate(req.body);
    if (error) {
      console.log("❌ Validation error:", error.details[0].message);
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

    console.log("✅ Input validated, generating quiz for:", subject);

    // Simple topic detection (no async calls to avoid hanging)
    let detectedTopic = subject;
    try {
      const topicResult = openaiService.detectTopicDemo(content);
      if (topicResult && topicResult.trim()) {
        detectedTopic = topicResult;
      }
      console.log("📝 Topic detected:", detectedTopic);
    } catch (error) {
      console.log("⚠️ Topic detection failed, using subject:", subject);
    }

    // Generate demo quiz (no async calls)
    console.log("🔧 Generating demo quiz...");
    const aiQuizData = openaiService.generateDemoQuiz(
      detectedTopic || subject,
      questionCount,
      questionTypes,
      difficulty
    );
    console.log(
      "✅ Quiz generated with",
      aiQuizData.questions.length,
      "questions"
    );

    // Return quiz data immediately (no database operations)
    const response = {
      success: true,
      message: "Quiz generated successfully!",
      quiz: {
        title: title || aiQuizData.title || `${detectedTopic} Quiz`,
        description: `AI-generated quiz covering ${detectedTopic} concepts`,
        subject: detectedTopic || subject,
        questions: aiQuizData.questions,
        difficulty: aiQuizData.difficulty || difficulty,
        settings: {
          timeLimit: timeLimit || 30,
          randomizeQuestions: true,
          showResultsImmediately: true,
          allowRetake: true,
        },
        isDemo: true,
      },
    };

    console.log("🎉 Sending response");
    res.json(response);
  } catch (error) {
    console.error("❌ Quiz generation error:", error);
    res.status(500).json({
      error: "Server error during quiz generation",
      details: error.message,
    });
  }
});

module.exports = router;
