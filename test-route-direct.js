const mongoose = require("mongoose");
require("dotenv").config();

async function testRouteLogicDirect() {
  console.log("🧪 Testing Route Logic Directly\n");

  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ai-exam-checker"
    );
    console.log("✅ Connected to MongoDB");

    // Load models
    const User = require("./server/models/User");
    const { Quiz } = require("./server/models/Quiz");

    // Get test user
    const testUser = await User.findOne({ email: "test@example.com" });
    if (!testUser) {
      console.log("❌ Test user not found");
      return;
    }
    console.log("✅ Test user found:", testUser.email);

    // Test the exact logic from the route handler
    console.log("\n📋 Testing quiz route logic...");

    const page = 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    console.log("📋 Searching for quizzes by user:", testUser._id);

    const quizzes = await Quiz.find({ createdBy: testUser._id })
      .select("title subject difficulty questionsCount createdAt analytics")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log("📋 Found quizzes:", quizzes.length);

    const total = await Quiz.countDocuments({ createdBy: testUser._id });
    console.log("📋 Total quizzes:", total);

    const result = {
      quizzes,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    };

    console.log("✅ Route logic completed successfully!");
    console.log("✅ Result structure:", {
      quizzesCount: result.quizzes.length,
      pagination: result.pagination,
    });

    // Test a specific quiz to make sure the data is valid
    if (result.quizzes.length > 0) {
      const firstQuiz = result.quizzes[0];
      console.log("✅ First quiz:", {
        id: firstQuiz._id,
        title: firstQuiz.title,
        subject: firstQuiz.subject,
        questionsCount: firstQuiz.questionsCount,
      });
    }
  } catch (error) {
    console.error("❌ Route logic test failed:", error.message);
    console.error("❌ Stack:", error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

testRouteLogicDirect();
