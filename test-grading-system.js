const axios = require("axios");

async function testGradingSystem() {
  console.log("🧪 Grading System Test");

  try {
    // Test demo quiz submission (no auth required)
    console.log("\n1. Testing demo quiz submission...");

    // Create answers that will get exactly 3 out of 5 correct (60% = D-)
    const demoAnswers = [
      { questionId: "q1", answer: "Chlorophyll", timeSpent: 15 }, // Correct
      { questionId: "q2", answer: "Chloroplast", timeSpent: 20 }, // Correct
      {
        questionId: "q3",
        answer: "6CO2 + 6H2O + light → C6H12O6 + 6O2",
        timeSpent: 18,
      }, // Correct
      { questionId: "q4", answer: "Wrong answer", timeSpent: 12 }, // Intentionally wrong
      { questionId: "q5", answer: "wrong, wrong", timeSpent: 10 }, // Intentionally wrong
    ];

    const submissionData = {
      answers: demoAnswers,
      timeSpent: demoAnswers.reduce((total, ans) => total + ans.timeSpent, 0),
    };

    console.log("Submitting demo quiz with mixed answers...");
    const demoResponse = await axios.post(
      "http://localhost:5000/api/quiz/demo-1/submit",
      submissionData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("Demo quiz response status:", demoResponse.status);
    console.log("Demo quiz results:", {
      score: demoResponse.data.attempt?.score,
      totalQuestions: demoResponse.data.attempt?.totalQuestions,
      percentage: demoResponse.data.attempt?.percentage,
      letterGrade: demoResponse.data.attempt?.letterGrade,
      gradeDescription: demoResponse.data.attempt?.gradeDescription,
      isPassing: demoResponse.data.attempt?.isPassing,
    });

    // Test different score scenarios
    console.log("\n2. Testing different score scenarios...");

    const testScenarios = [
      { score: 5, total: 5, expected: "A+" },
      { score: 4, total: 5, expected: "B-" },
      { score: 3, total: 5, expected: "D-" },
      { score: 2, total: 5, expected: "F" },
      { score: 1, total: 5, expected: "F" },
      { score: 0, total: 5, expected: "F" },
    ];

    for (const scenario of testScenarios) {
      const percentage = Math.round((scenario.score / scenario.total) * 100);
      console.log(
        `${scenario.score}/${scenario.total} (${percentage}%) should be ${scenario.expected}`
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testGradingSystem();
