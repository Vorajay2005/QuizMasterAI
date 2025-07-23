const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function testSimpleAuth() {
  console.log("🧪 Simple Auth Test\n");

  try {
    // Login first
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
    const token = loginData.token;
    console.log("✅ Login successful");

    // Test a simple authenticated request to see if auth middleware works
    console.log("\n2. Testing auth middleware...");
    const testResponse = await fetch("http://localhost:5000/api/quiz/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`Status: ${testResponse.status}`);
    const responseText = await testResponse.text();
    console.log("Response:", responseText);
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

testSimpleAuth();
