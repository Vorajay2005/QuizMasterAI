const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function testAuth() {
  console.log("🧪 Testing Authentication\n");

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
      const error = await loginResponse.text();
      console.log("❌ Login failed:", error);
      return;
    }

    const loginData = await loginResponse.json();
    const authToken = loginData.token;
    console.log("✅ Login successful");
    console.log("Token:", authToken.substring(0, 50) + "...");

    // Step 2: Test protected route
    console.log("\n2. Testing protected route...");
    const userResponse = await fetch("http://localhost:5000/api/user/profile", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log(`User profile status: ${userResponse.status}`);
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log("✅ Auth working, user:", userData.email);
    } else {
      const error = await userResponse.text();
      console.log("❌ Auth failed:", error);
    }

    // Step 3: Test the new user quizzes route
    console.log("\n3. Testing user quizzes route...");
    const quizzesResponse = await fetch("http://localhost:5000/api/quiz/user", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log(`User quizzes status: ${quizzesResponse.status}`);
    if (quizzesResponse.ok) {
      const quizzesData = await quizzesResponse.json();
      console.log("✅ User quizzes route working");
      console.log(`Found ${quizzesData.quizzes.length} quizzes`);
    } else {
      const error = await quizzesResponse.text();
      console.log("❌ User quizzes route failed:", error);
    }
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }
}

testAuth();
