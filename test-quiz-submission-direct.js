const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function testQuizSubmissionDirect() {
  console.log("🧪 Testing Quiz Submission Directly\n");

  try {
    // Step 1: Login to get auth token
    console.log("1. Logging in...");
    const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    if (!loginResponse.ok) {
      console.log("❌ Login failed");
      return;
    }

    const loginData = await loginResponse.json();
    const authToken = loginData.token;
    console.log("✅ Login successful");

    // Step 2: Get a quiz ID from the user's created quizzes
    console.log("\n2. Getting user's quiz list...");
    const quizzesResponse = await fetch("http://localhost:5000/api/quiz/user", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!quizzesResponse.ok) {
      console.log("❌ Failed to get quiz list:", await quizzesResponse.text());
      return;
    }

    const quizzesData = await quizzesResponse.json();
    console.log(`✅ Found ${quizzesData.quizzes.length} quizzes`);

    if (quizzesData.quizzes.length === 0) {
      console.log("❌ No quizzes found to test submission");
      return;
    }

    const testQuiz = quizzesData.quizzes[0];
    console.log(`✅ Using quiz: ${testQuiz.title} (ID: ${testQuiz._id})`);

    // Step 3: Get the quiz details to see the questions
    console.log("\n3. Getting quiz details...");
    const quizResponse = await fetch(
      `http://localhost:5000/api/quiz/${testQuiz._id}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!quizResponse.ok) {
      console.log("❌ Failed to get quiz details:", await quizResponse.text());
      return;
    }

    const quizData = await quizResponse.json();
    console.log(`✅ Quiz loaded with ${quizData.questions.length} questions`);

    // Step 4: Submit the quiz with sample answers
    console.log("\n4. Submitting quiz...");
    const answers = quizData.questions.map((question, index) => ({
      questionId: question._id,
      answer:
        question.type === "mcq"
          ? question.options[0]
          : "Sample answer for question " + (index + 1),
      timeSpent: 30 + Math.floor(Math.random() * 60), // Random time between 30-90 seconds
    }));

    const submissionData = {
      answers,
      timeSpent: answers.reduce((total, ans) => total + ans.timeSpent, 0),
    };

    console.log(`Submitting ${answers.length} answers...`);

    const submitResponse = await fetch(
      `http://localhost:5000/api/quiz/${testQuiz._id}/submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(submissionData),
      }
    );

    console.log(`Submission status: ${submitResponse.status}`);

    if (submitResponse.ok) {
      const result = await submitResponse.json();
      console.log("✅ Quiz submission successful!");
      console.log(
        `Score: ${result.attempt.score}/${result.attempt.totalQuestions}`
      );
      console.log(`Percentage: ${result.attempt.percentage}%`);
      console.log(`Message: ${result.message}`);
    } else {
      const error = await submitResponse.text();
      console.log("❌ Quiz submission failed:");
      console.log("Status:", submitResponse.status);
      console.log("Error:", error);
    }
  } catch (error) {
    console.log("❌ Test failed with error:", error.message);
    console.log("Stack:", error.stack);
  }
}

testQuizSubmissionDirect();
