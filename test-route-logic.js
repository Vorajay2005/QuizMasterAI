// Test the route handler logic without HTTP
const openaiService = require("./server/services/openaiService");

async function testRouteLogic() {
  console.log("🧪 Testing route logic...");

  const mockReqBody = {
    title: "Test Quiz",
    subject: "Mathematics",
    content:
      "Basic algebra and linear equations with variables and coefficients",
    difficulty: "medium",
    questionCount: 5,
    questionTypes: ["mcq"],
    timeLimit: 15,
    isPublic: false,
  };

  try {
    console.log("1️⃣ Starting topic detection...");

    // Auto-detect specific topic from content
    let detectedTopic = mockReqBody.subject;
    try {
      const topicResult = await openaiService.detectTopic(mockReqBody.content);
      if (topicResult && topicResult.trim()) {
        detectedTopic = topicResult;
      }
      console.log("✅ Topic detected:", detectedTopic);
    } catch (error) {
      console.log(
        "⚠️ Topic detection failed, using provided subject:",
        error.message
      );
      // Continue with provided subject
    }

    console.log("2️⃣ Starting quiz generation...");

    // Generate quiz using OpenAI (with fallback for demo mode)
    let aiQuizData;
    try {
      aiQuizData = await openaiService.generateQuiz(mockReqBody.content, {
        difficulty: mockReqBody.difficulty,
        questionCount: mockReqBody.questionCount,
        questionTypes: mockReqBody.questionTypes,
        subject: detectedTopic,
      });
      console.log("✅ AI Quiz generated");
    } catch (error) {
      console.error("⚠️ AI quiz generation failed:", error.message);

      // Fallback to demo quiz generation
      console.log("🔄 Falling back to demo quiz generation...");
      aiQuizData = openaiService.generateDemoQuiz(
        detectedTopic || mockReqBody.subject,
        mockReqBody.questionCount,
        mockReqBody.questionTypes,
        mockReqBody.difficulty
      );
      console.log("✅ Fallback quiz generated");
    }

    console.log("3️⃣ Quiz data ready");
    console.log("Title:", aiQuizData.title);
    console.log("Questions:", aiQuizData.questions.length);
    console.log(
      "First question:",
      aiQuizData.questions[0].question.substring(0, 50) + "..."
    );

    const mockResponse = {
      success: true,
      message: "Demo quiz generated successfully!",
      quiz: {
        title: mockReqBody.title || aiQuizData.title || `${detectedTopic} Quiz`,
        description: `AI-generated quiz covering ${detectedTopic} concepts`,
        subject: detectedTopic || mockReqBody.subject,
        questions: aiQuizData.questions,
        difficulty: aiQuizData.difficulty || mockReqBody.difficulty,
        settings: {
          timeLimit: mockReqBody.timeLimit,
          randomizeQuestions: true,
          showResultsImmediately: true,
          allowRetake: true,
        },
        isDemo: true,
      },
    };

    console.log("🎉 Route logic completed successfully!");
    return mockResponse;
  } catch (error) {
    console.error("❌ Route logic failed:", error);
    throw error;
  }
}

// Run the test
testRouteLogic()
  .then((result) => {
    console.log("✅ Test completed successfully");
    console.log("Final subject:", result.quiz.subject);
    console.log("Final title:", result.quiz.title);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
  });
