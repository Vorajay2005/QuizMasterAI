const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function testQuizSubmission() {
  console.log("🧪 Testing Quiz Submission\n");

  // Test demo quiz submission (no auth)
  console.log("1. Testing demo quiz submission (no auth)...");
  try {
    const response = await fetch(
      "http://localhost:5000/api/quiz/demo-1/submit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: [
            { questionId: "q1", answer: "Chlorophyll", timeSpent: 10 },
            { questionId: "q2", answer: "Chloroplast", timeSpent: 15 },
            {
              questionId: "q3",
              answer: "6CO2 + 6H2O + light → C6H12O6 + 6O2",
              timeSpent: 20,
            },
            {
              questionId: "q4",
              answer: "Light-dependent reactions and Calvin cycle",
              timeSpent: 25,
            },
            { questionId: "q5", answer: "thylakoids, stroma", timeSpent: 18 },
          ],
          timeSpent: 120,
        }),
      }
    );

    console.log(`Status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Demo submission successful!");
      console.log(
        `Score: ${result.attempt.score}/${result.attempt.totalQuestions}`
      );
      console.log(`Percentage: ${result.attempt.percentage}%`);
      console.log(`Message: ${result.message}`);
    } else {
      const error = await response.text();
      console.log("❌ Demo submission failed:", error);
    }
  } catch (error) {
    console.log("❌ Demo submission error:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test with invalid quiz ID
  console.log("2. Testing with invalid quiz ID...");
  try {
    const response = await fetch(
      "http://localhost:5000/api/quiz/invalid-id/submit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: [{ questionId: "q1", answer: "test", timeSpent: 10 }],
          timeSpent: 60,
        }),
      }
    );

    console.log(`Status: ${response.status}`);
    const result = await response.text();
    console.log("Response:", result);
  } catch (error) {
    console.log("❌ Invalid ID test error:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test with malformed data
  console.log("3. Testing with malformed data...");
  try {
    const response = await fetch(
      "http://localhost:5000/api/quiz/demo-1/submit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Missing required fields
          answers: [],
        }),
      }
    );

    console.log(`Status: ${response.status}`);
    const result = await response.text();
    console.log("Response:", result);
  } catch (error) {
    console.log("❌ Malformed data test error:", error.message);
  }
}

testQuizSubmission();
