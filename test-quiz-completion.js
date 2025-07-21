#!/usr/bin/env node

/**
 * Test script to verify quiz completion updates dashboard
 * This script simulates a quiz completion and checks if dashboard updates
 */

const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";
const TEST_USER = {
  email: "test@example.com",
  password: "testpass123",
  name: "Test User",
};

let authToken = "";

async function testQuizCompletionFlow() {
  console.log("🧪 Testing Quiz Completion Flow...\n");

  try {
    // 1. Register or login test user
    console.log("📋 Step 1: Authenticating test user...");
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });
      authToken = loginResponse.data.token;
      console.log("✅ User logged in successfully");
    } catch (loginError) {
      // Try to register if login fails
      console.log("🔑 User not found, registering...");
      const registerResponse = await axios.post(
        `${BASE_URL}/auth/register`,
        TEST_USER
      );
      authToken = registerResponse.data.token;
      console.log("✅ User registered and logged in");
    }

    const headers = { Authorization: `Bearer ${authToken}` };

    // 2. Get initial dashboard stats
    console.log("\n📊 Step 2: Getting initial dashboard stats...");
    const initialStatsResponse = await axios.get(
      `${BASE_URL}/quiz/user/stats`,
      { headers }
    );
    console.log("📈 Initial stats:", {
      totalQuizzes: initialStatsResponse.data.totalQuizzes,
      averageScore: initialStatsResponse.data.averageScore,
    });

    // 3. Create a test quiz
    console.log("\n📝 Step 3: Creating test quiz...");
    const quizData = {
      title: "Test Quiz for Dashboard Update",
      subject: "Testing",
      content:
        "This is a test quiz to verify dashboard updates work correctly.",
      difficulty: "easy",
      questionCount: 3,
      questionTypes: ["mcq"],
      timeLimit: 10,
      isPublic: false,
    };

    const createQuizResponse = await axios.post(
      `${BASE_URL}/quiz/generate`,
      quizData,
      { headers }
    );
    const testQuiz = createQuizResponse.data.quiz;
    console.log("✅ Test quiz created:", testQuiz.title);

    // 4. Submit test quiz answers
    console.log("\n✉️ Step 4: Submitting quiz answers...");
    const answers = testQuiz.questions.map((question, index) => ({
      questionId: question._id,
      answer: question.options ? question.options[0] : "Test answer",
      timeSpent: 30,
    }));

    const submitResponse = await axios.post(
      `${BASE_URL}/quiz/${testQuiz._id}/submit`,
      {
        answers,
        timeSpent: 180,
      },
      { headers }
    );

    console.log("✅ Quiz submitted successfully");
    console.log("🎯 Score:", submitResponse.data.attempt.percentage + "%");

    // 5. Check updated dashboard stats
    console.log("\n🔄 Step 5: Checking updated dashboard stats...");

    // Wait a moment for data to be processed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedStatsResponse = await axios.get(
      `${BASE_URL}/quiz/user/stats`,
      { headers }
    );
    console.log("📈 Updated stats:", {
      totalQuizzes: updatedStatsResponse.data.totalQuizzes,
      averageScore: updatedStatsResponse.data.averageScore,
    });

    // 6. Verify the update
    const statsDiff = {
      quizzesDiff:
        updatedStatsResponse.data.totalQuizzes -
        initialStatsResponse.data.totalQuizzes,
      scoreChange:
        updatedStatsResponse.data.averageScore -
        initialStatsResponse.data.averageScore,
    };

    console.log("\n🎉 Test Results:");
    console.log(`✅ Quizzes increased by: ${statsDiff.quizzesDiff}`);
    console.log(`📊 Score change: ${statsDiff.scoreChange.toFixed(1)}%`);

    if (statsDiff.quizzesDiff === 1) {
      console.log("🟢 SUCCESS: Quiz completion properly updates dashboard!");
    } else {
      console.log("🔴 ISSUE: Quiz count did not increase as expected");
    }

    // 7. Check recent attempts
    console.log("\n📋 Step 6: Checking recent attempts...");
    const attemptsResponse = await axios.get(
      `${BASE_URL}/quiz/user/attempts?limit=3`,
      { headers }
    );
    const recentAttempts = attemptsResponse.data.attempts;

    console.log(`📚 Recent attempts (${recentAttempts.length}):`);
    recentAttempts.forEach((attempt, index) => {
      console.log(
        `  ${index + 1}. ${attempt.quizId?.title || "Quiz"} - ${
          attempt.percentage
        }%`
      );
    });

    if (recentAttempts.some((a) => a.quizId?._id === testQuiz._id)) {
      console.log("🟢 SUCCESS: Latest attempt appears in recent attempts!");
    } else {
      console.log("🔴 ISSUE: Latest attempt not found in recent attempts");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run the test
testQuizCompletionFlow();
