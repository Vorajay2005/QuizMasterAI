const express = require("express");
const app = express();

app.use(express.json());

// Test route 1 - basic
app.post("/test1", (req, res) => {
  console.log("✅ Test1: Basic route works");
  res.json({ message: "Basic route working" });
});

// Test route 2 - with openaiService import
app.post("/test2", (req, res) => {
  try {
    console.log("✅ Test2: Importing openaiService...");
    const openaiService = require("./server/services/openaiService");
    console.log("✅ Test2: OpenAI service imported");
    res.json({ message: "OpenAI service import working" });
  } catch (error) {
    console.error("❌ Test2: Error importing openaiService:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test route 3 - with detectTopicDemo
app.post("/test3", (req, res) => {
  try {
    console.log("✅ Test3: Testing detectTopicDemo...");
    const openaiService = require("./server/services/openaiService");
    const topic = openaiService.detectTopicDemo("basic algebra equations");
    console.log("✅ Test3: Topic detected:", topic);
    res.json({ message: "detectTopicDemo working", topic });
  } catch (error) {
    console.error("❌ Test3: Error with detectTopicDemo:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test route 4 - with generateDemoQuiz
app.post("/test4", (req, res) => {
  try {
    console.log("✅ Test4: Testing generateDemoQuiz...");
    const openaiService = require("./server/services/openaiService");
    const quiz = openaiService.generateDemoQuiz(
      "Mathematics",
      5,
      ["mcq"],
      "medium"
    );
    console.log("✅ Test4: Quiz generated");
    res.json({
      message: "generateDemoQuiz working",
      questionCount: quiz.questions.length,
    });
  } catch (error) {
    console.error("❌ Test4: Error with generateDemoQuiz:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Minimal test server running on port ${PORT}`);
});
