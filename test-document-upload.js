const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

async function testDocumentUpload() {
  console.log("🧪 Document Upload Test");

  try {
    // Create a simple test document
    const testContent = `
# Sample Document for Quiz Generation

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

This document contains enough content to generate meaningful quiz questions about JavaScript programming concepts.
    `.trim();

    // Write test file
    const testFilePath = path.join(__dirname, "test-document.txt");
    fs.writeFileSync(testFilePath, testContent);

    // Create form data
    const form = new FormData();
    form.append("document", fs.createReadStream(testFilePath));

    console.log("\n1. Uploading test document...");

    const response = await fetch(
      "http://localhost:5000/api/quiz/upload-document",
      {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
      }
    );

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log("✅ Success! Parsed data:", {
        success: data.success,
        message: data.message,
        contentLength: data.data?.content?.length,
        detectedTopic: data.data?.detectedTopic,
        wordCount: data.data?.wordCount,
        analysisKeys: data.data?.analysis
          ? Object.keys(data.data.analysis)
          : "No analysis",
      });
    } else {
      console.log("❌ Request failed with status:", response.status);
      try {
        const errorData = JSON.parse(responseText);
        console.log("Error details:", errorData);
      } catch (e) {
        console.log("Could not parse error response as JSON");
      }
    }

    // Clean up test file
    fs.unlinkSync(testFilePath);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testDocumentUpload();
