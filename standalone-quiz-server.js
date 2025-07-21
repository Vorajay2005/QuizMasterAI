const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory quiz generation using the same logic as our service
function generateStandaloneQuiz(
  subject,
  content,
  questionCount = 5,
  difficulty = "medium"
) {
  // Simple topic detection
  function detectTopic(content) {
    const text = content.toLowerCase();
    if (
      text.includes("math") ||
      text.includes("algebra") ||
      text.includes("equation")
    ) {
      return "Mathematics";
    } else if (
      text.includes("bio") ||
      text.includes("life") ||
      text.includes("cell")
    ) {
      return "Biology";
    } else if (
      text.includes("chem") ||
      text.includes("molecule") ||
      text.includes("atom")
    ) {
      return "Chemistry";
    } else if (
      text.includes("phys") ||
      text.includes("force") ||
      text.includes("motion")
    ) {
      return "Physics";
    }
    return subject;
  }

  const detectedTopic = detectTopic(content);

  // Question banks
  const questionBanks = {
    Mathematics: {
      mcq: [
        {
          question: "What is the value of x in the equation 2x + 5 = 11?",
          options: ["x = 2", "x = 3", "x = 4", "x = 5"],
          correctAnswer: "x = 3",
          explanation:
            "Subtract 5 from both sides: 2x = 6, then divide by 2: x = 3",
          difficulty: "medium",
        },
        {
          question: "Which of the following is equivalent to 3(x + 4)?",
          options: ["3x + 4", "3x + 12", "x + 12", "3x + 7"],
          correctAnswer: "3x + 12",
          explanation:
            "Use the distributive property: 3(x + 4) = 3x + 3(4) = 3x + 12",
          difficulty: "medium",
        },
        {
          question: "If y = 2x + 1, what is the value of y when x = 4?",
          options: ["7", "8", "9", "10"],
          correctAnswer: "9",
          explanation: "Substitute x = 4: y = 2(4) + 1 = 8 + 1 = 9",
          difficulty: "easy",
        },
        {
          question:
            "What is the slope of the line passing through points (1, 2) and (3, 8)?",
          options: ["2", "3", "4", "6"],
          correctAnswer: "3",
          explanation:
            "Slope = (y2 - y1)/(x2 - x1) = (8 - 2)/(3 - 1) = 6/2 = 3",
          difficulty: "medium",
        },
        {
          question: "Solve for x: x² - 5x + 6 = 0",
          options: ["x = 1, 6", "x = 2, 3", "x = -2, -3", "x = 1, 5"],
          correctAnswer: "x = 2, 3",
          explanation: "Factor: (x - 2)(x - 3) = 0, so x = 2 or x = 3",
          difficulty: "hard",
        },
      ],
    },
    Biology: {
      mcq: [
        {
          question: "What is the primary function of mitochondria?",
          options: [
            "Protein synthesis",
            "Energy production",
            "DNA storage",
            "Waste removal",
          ],
          correctAnswer: "Energy production",
          explanation:
            "Mitochondria are the powerhouses of the cell, producing ATP energy",
          difficulty: "medium",
        },
      ],
    },
  };

  // Get questions for the detected topic
  const subjectQuestions =
    questionBanks[detectedTopic] || questionBanks["Mathematics"];
  const questions = [];

  // Generate questions
  for (let i = 0; i < Math.min(questionCount, 5); i++) {
    const mcqQuestions = subjectQuestions.mcq;
    const selectedQuestion = mcqQuestions[i % mcqQuestions.length];

    questions.push({
      ...selectedQuestion,
      type: "mcq",
      topic: detectedTopic,
      keywords: selectedQuestion.correctAnswer.split(" ").slice(0, 3),
    });
  }

  return {
    title: `${detectedTopic} Quiz`,
    subject: detectedTopic,
    questions: questions,
    difficulty: difficulty,
    totalQuestions: questions.length,
  };
}

// Quiz generation endpoint
app.post("/api/quiz/generate", (req, res) => {
  console.log("📝 Quiz generation request received");

  try {
    const {
      subject,
      content,
      difficulty = "medium",
      questionCount = 5,
    } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        error: "Subject and content are required",
      });
    }

    console.log(`🎯 Generating quiz for: ${subject}`);
    console.log(`📖 Content length: ${content.length} characters`);

    const quizData = generateStandaloneQuiz(
      subject,
      content,
      questionCount,
      difficulty
    );

    console.log(
      `✅ Generated ${quizData.questions.length} questions for ${quizData.subject}`
    );

    const response = {
      success: true,
      message: "Quiz generated successfully!",
      quiz: {
        title: quizData.title,
        description: `AI-generated quiz covering ${quizData.subject} concepts`,
        subject: quizData.subject,
        questions: quizData.questions,
        difficulty: difficulty,
        settings: {
          timeLimit: 30,
          randomizeQuestions: true,
          showResultsImmediately: true,
          allowRetake: true,
        },
        isDemo: true,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Quiz generation error:", error);
    res.status(500).json({
      error: "Server error during quiz generation",
      details: error.message,
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
const PORT = 5003;
app.listen(PORT, () => {
  console.log(`🚀 Standalone quiz server running on port ${PORT}`);
  console.log(
    `📋 Test with: curl -X POST http://localhost:${PORT}/api/quiz/generate`
  );
});
