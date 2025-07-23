const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function testDebugRoute() {
  console.log("🐛 Testing Debug Route\n");

  try {
    const response = await fetch(
      "http://localhost:5000/api/quiz/debug-no-auth"
    );
    console.log("Response status:", response.status);

    const data = await response.json();
    console.log("Response data:", data);
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }
}

testDebugRoute();
