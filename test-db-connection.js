const mongoose = require("mongoose");
require("dotenv").config();

async function testDatabaseConnection() {
  console.log("🧪 Testing Database Connection\n");

  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ai-exam-checker"
    );
    console.log("✅ Connected to MongoDB");

    // Test Quiz model
    const { Quiz, QuizAttempt } = require("./server/models/Quiz");
    console.log("✅ Quiz model loaded");

    // Test User model
    const User = require("./server/models/User");
    console.log("✅ User model loaded");

    // Test finding a user
    const users = await User.find().limit(1);
    console.log(`✅ Found ${users.length} users in database`);

    // Test finding quizzes
    const quizzes = await Quiz.find().limit(1);
    console.log(`✅ Found ${quizzes.length} quizzes in database`);

    // Test the specific query that's failing
    if (users.length > 0) {
      const userId = users[0]._id;
      console.log(`\n🔍 Testing quiz query for user: ${userId}`);

      const userQuizzes = await Quiz.find({ createdBy: userId })
        .select("title subject difficulty questionsCount createdAt analytics")
        .sort({ createdAt: -1 })
        .limit(10);

      console.log(`✅ Found ${userQuizzes.length} quizzes for user`);
    }

    console.log("\n✅ All database tests passed!");
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    console.error("❌ Stack:", error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

testDatabaseConnection();
