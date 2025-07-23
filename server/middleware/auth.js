const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    console.log("🔐 Auth middleware called");
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("🔐 Token received:", token ? "Yes" : "No");

    if (!token) {
      console.log("🔐 No token provided");
      return res
        .status(401)
        .json({ error: "No token provided, authorization denied" });
    }

    console.log("🔐 JWT_SECRET exists:", !!process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔐 Token decoded, user ID:", decoded.id);

    const user = await User.findById(decoded.id).select("-password");
    console.log("🔐 User found:", user ? user.email : "No user");

    if (!user) {
      console.log("🔐 User not found in database");
      return res.status(401).json({ error: "Token is not valid" });
    }

    req.user = user;
    console.log("🔐 Auth successful, proceeding to next middleware");
    next();
  } catch (error) {
    console.error("🔐 Auth middleware error:", error.message);
    console.error("🔐 Auth error stack:", error.stack);

    // If it's a JWT error, return 401, otherwise return 500
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      res.status(401).json({ error: "Token is not valid" });
    } else {
      res.status(500).json({
        error: "Server error in auth middleware",
        details: error.message,
      });
    }
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without auth if token is invalid
    next();
  }
};

module.exports = { auth, optionalAuth };
