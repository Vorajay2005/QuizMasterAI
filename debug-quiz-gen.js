// Debug script to test quiz generation directly
const openaiService = require("./server/services/openaiService");

console.log("Testing topic detection...");

try {
  const topic = openaiService.detectTopicDemo(
    "This is about basic algebra and solving linear equations with variables"
  );
  console.log("Detected topic:", topic);
} catch (error) {
  console.error("Topic detection error:", error);
}

console.log("\nTesting quiz generation...");

try {
  const result = openaiService.generateDemoQuiz(
    "Mathematics",
    5,
    ["mcq"],
    "medium"
  );
  console.log("Success!");
  console.log("Title:", result.title);
  console.log("Questions count:", result.questions.length);
  console.log("First question:", result.questions[0].question);
} catch (error) {
  console.error("Error:", error);
}
