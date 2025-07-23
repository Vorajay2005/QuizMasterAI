const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function testLoggedInSubmission() {
  console.log("🧪 Testing Logged-in User Quiz Submission\n");

  let authToken = null;
  let quizId = null;

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

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      authToken = loginData.token;
      console.log("✅ Login successful");
    } else {
      // Try to register if login fails
      console.log("Login failed, trying to register...");
      const registerResponse = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
          }),
        }
      );

      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        authToken = registerData.token;
        console.log("✅ Registration successful");
      } else {
        const error = await registerResponse.text();
        console.log("❌ Registration failed:", error);
        return;
      }
    }

    // Step 2: Get user's quizzes to find one created from uploaded content
    console.log("\n2. Getting user's quizzes...");
    const quizzesResponse = await fetch("http://localhost:5000/api/quiz/user", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (quizzesResponse.ok) {
      const quizzesData = await quizzesResponse.json();
      console.log(`Found ${quizzesData.quizzes.length} user quizzes`);

      if (quizzesData.quizzes.length > 0) {
        quizId = quizzesData.quizzes[0]._id;
        console.log(`✅ Using quiz ID: ${quizId}`);
        console.log(`Quiz title: ${quizzesData.quizzes[0].title}`);
      } else {
        console.log("❌ No user quizzes found. Creating one...");

        // Create a quiz from uploaded content
        const FormData = require("form-data");
        const fs = require("fs");
        const path = require("path");

        const testContent = `Biology: Cell Structure and Function

Cells are the basic units of life. All living organisms are composed of one or more cells. The cell theory states that all living things are made of cells, cells are the basic unit of life, and all cells come from pre-existing cells.

Plant cells have several unique structures including chloroplasts for photosynthesis, a cell wall for structural support, and a large central vacuole for storage. Animal cells lack these structures but have centrioles that help with cell division.

The cell membrane controls what enters and exits the cell through selective permeability. The nucleus contains the cell's DNA and controls cellular activities. Mitochondria are the powerhouses of the cell, producing ATP through cellular respiration.`;

        const testFilePath = path.join(__dirname, "test-biology.txt");
        fs.writeFileSync(testFilePath, testContent);

        const formData = new FormData();
        formData.append("document", fs.createReadStream(testFilePath));

        const uploadResponse = await fetch(
          "http://localhost:5000/api/quiz/upload-document",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: formData,
          }
        );

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          quizId = uploadData.quiz._id;
          console.log(`✅ Created quiz ID: ${quizId}`);
          fs.unlinkSync(testFilePath); // Clean up
        } else {
          const error = await uploadResponse.text();
          console.log("❌ Quiz creation failed:", error);
          fs.unlinkSync(testFilePath); // Clean up
          return;
        }
      }
    } else {
      const error = await quizzesResponse.text();
      console.log("❌ Failed to get user quizzes:", error);
      return;
    }

    // Step 3: Get the quiz details to see the questions
    console.log("\n3. Getting quiz details...");
    const quizResponse = await fetch(
      `http://localhost:5000/api/quiz/${quizId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!quizResponse.ok) {
      const error = await quizResponse.text();
      console.log("❌ Failed to get quiz details:", error);
      return;
    }

    const quizData = await quizResponse.json();
    console.log(`✅ Quiz loaded: ${quizData.title}`);
    console.log(`Questions count: ${quizData.questions.length}`);

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

    console.log("Submission data:", JSON.stringify(submissionData, null, 2));

    const submitResponse = await fetch(
      `http://localhost:5000/api/quiz/${quizId}/submit`,
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

testLoggedInSubmission();
