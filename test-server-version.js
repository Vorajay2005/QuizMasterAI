const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function testServerVersion() {
  console.log("🧪 Testing Server Version\n");

  try {
    // Test health endpoint to see if server is responding
    const response = await fetch("http://localhost:5000/api/health");
    const data = await response.json();
    console.log("✅ Health check:", data);

    // Test a non-existent route to trigger error handler
    console.log("\n🧪 Testing error handler with non-existent route...");
    const errorResponse = await fetch("http://localhost:5000/api/nonexistent");
    console.log("Error response status:", errorResponse.status);
    const errorData = await errorResponse.json();
    console.log("Error response:", errorData);
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }
}

testServerVersion();
