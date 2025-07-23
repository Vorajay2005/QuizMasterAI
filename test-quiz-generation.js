const axios = require("axios");

async function testQuizGeneration() {
  console.log("🧪 Quiz Generation Test");

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

    // Step 2: Test quiz generation with document content
    console.log("\n2. Testing quiz generation with document content...");

    const documentContent = `# Sample Document for Quiz Generation

This is a test document that contains educational content about JavaScript programming.

## Variables and Data Types

JavaScript has several data types:
- String: Used for text data
- Number: Used for numeric values
- Boolean: Used for true/false values
- Object: Used for complex data structures
- Array: Used for ordered lists of data

## Functions

Functions in JavaScript are blocks of reusable code. They can be declared using the function keyword or as arrow functions.

Example:
function greet(name) {
  return "Hello, " + name + "!";
}

## Loops

JavaScript provides several types of loops:
- for loop: Used when you know how many times to loop
- while loop: Used when you want to loop while a condition is true
- for...in loop: Used to loop through object properties
- for...of loop: Used to loop through iterable objects

This document contains enough content to generate meaningful quiz questions about JavaScript programming concepts.`;

    const quizData = {
      title: "JavaScript Basics Quiz",
      subject: "JavaScript",
      content: documentContent,
      difficulty: "medium",
      questionCount: 5,
      questionTypes: ["mcq", "short"],
      timeLimit: 30,
      isPublic: false,
    };

    console.log("Sending quiz generation request...");
    const response = await axios.post(
      "http://localhost:5000/api/quiz/generate",
      quizData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log("Response status:", response.status);
    console.log("✅ Success! Quiz generated:", {
      message: response.data.message,
      quizId: response.data.quiz?._id,
      title: response.data.quiz?.title,
      questionsCount: response.data.quiz?.questions?.length,
      difficulty: response.data.quiz?.difficulty,
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

testQuizGeneration();
