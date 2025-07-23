const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function testMinimalRequest() {
  console.log("🧪 Minimal Request Test\n");

  try {
    // Step 1: Login
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

    if (!loginResponse.ok) {
      console.log("❌ Login failed");
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log("✅ Login successful");

    // Step 2: Test the fixed user route
    console.log("\n2. Testing fixed user route /api/quiz/user...");

    try {
      const response = await fetch("http://localhost:5000/api/quiz/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log("✅ Success! Parsed data:", data);
        } catch (parseError) {
          console.log("❌ Failed to parse JSON:", parseError.message);
        }
      } else {
        console.log("❌ Request failed with status:", response.status);
        try {
          const errorData = JSON.parse(responseText);
          console.log("Error details:", errorData);
        } catch (parseError) {
          console.log("Raw error response:", responseText);
        }
      }
    } catch (fetchError) {
      console.log("❌ Fetch error:", fetchError.message);
    }
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }
}

testMinimalRequest();
