const axios = require("axios");

async function testQuizSubmission() {
  console.log("🧪 Quiz Submission Test");

  try {
    // Step 1: Login to get token
    console.log("\n1. Logging in...");
    const loginResponse = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email: "test@example.com",
        password: "password123",
      }
    );

    const token = loginResponse.data.token;
    console.log("✅ Login successful");

    // Step 2: Get user's quizzes to find one to submit
    console.log("\n2. Getting user's quizzes...");
    const quizzesResponse = await axios.get(
      "http://localhost:5000/api/quiz/user",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Available quizzes:", quizzesResponse.data.quizzes.length);

    if (quizzesResponse.data.quizzes.length === 0) {
      console.log("❌ No quizzes found. Please create a quiz first.");
      return;
    }

    const quiz = quizzesResponse.data.quizzes[0];
    console.log("Using quiz:", {
      id: quiz._id,
      title: quiz.title,
      questionsCount: quiz.questions?.length,
    });

    // Step 3: Get the quiz details to see the questions
    console.log("\n3. Getting quiz details...");
    const quizResponse = await axios.get(
      `http://localhost:5000/api/quiz/${quiz._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const quizDetails = quizResponse.data.quiz;
    console.log("Quiz details:", {
      title: quizDetails.title,
      questionsCount: quizDetails.questions.length,
      firstQuestion:
        quizDetails.questions[0]?.question?.substring(0, 50) + "...",
    });

    // Step 4: Create sample answers
    console.log("\n4. Creating sample answers...");
    const answers = quizDetails.questions.map((question, index) => ({
      questionId: question._id,
      answer: question.type === "mcq" ? "A" : `Sample answer ${index + 1}`,
      timeSpent: Math.floor(Math.random() * 30) + 10, // Random time between 10-40 seconds
    }));

    console.log(
      "Sample answers:",
      answers.map((a) => ({
        questionId: a.questionId,
        answer: a.answer,
        timeSpent: a.timeSpent,
      }))
    );

    // Step 5: Submit the quiz
    console.log("\n5. Submitting quiz answers...");
    const submissionData = {
      answers: answers,
      timeSpent: answers.reduce((total, ans) => total + ans.timeSpent, 0),
    };

    console.log("Submission data:", {
      answersCount: submissionData.answers.length,
      totalTimeSpent: submissionData.timeSpent,
    });

    const submissionResponse = await axios.post(
      `http://localhost:5000/api/quiz/${quiz._id}/submit`,
      submissionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log("Response status:", submissionResponse.status);
    console.log("✅ Success! Quiz submitted:", {
      message: submissionResponse.data.message,
      score: submissionResponse.data.attempt?.score,
      totalQuestions: submissionResponse.data.attempt?.totalQuestions,
      percentage: submissionResponse.data.attempt?.percentage,
    });
  } catch (error) {
    console.error("❌ Test failed:", error.message);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error details:", error);
    }
  }
}

testQuizSubmission();
