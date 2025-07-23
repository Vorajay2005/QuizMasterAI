const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

async function testAuthDirect() {
  console.log("🧪 Testing Auth Middleware Directly\n");

  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ai-exam-checker"
    );
    console.log("✅ Connected to MongoDB");

    // Load models
    const User = require("./server/models/User");
    const { auth } = require("./server/middleware/auth");

    // Create a test token
    const testUser = await User.findOne({ email: "test@example.com" });
    if (!testUser) {
      console.log("❌ Test user not found");
      return;
    }

    console.log("✅ Test user found:", testUser.email);
    console.log("✅ JWT_SECRET exists:", !!process.env.JWT_SECRET);

    // Create a token
    const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("✅ Token created");

    // Mock request and response objects
    const mockReq = {
      header: (name) => {
        if (name === "Authorization") {
          return `Bearer ${token}`;
        }
        return null;
      },
    };

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`❌ Auth middleware returned ${code}:`, data);
        },
      }),
    };

    const mockNext = () => {
      console.log("✅ Auth middleware called next() - success!");
      console.log(
        "✅ User attached to request:",
        mockReq.user ? mockReq.user.email : "No user"
      );
    };

    // Test the auth middleware
    console.log("\n🔐 Testing auth middleware...");
    await auth(mockReq, mockRes, mockNext);
  } catch (error) {
    console.error("❌ Direct auth test failed:", error.message);
    console.error("❌ Stack:", error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

testAuthDirect();
