#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log(
  "🚀 Setting up AI Exam Readiness Checker for Panda Hacks 2025...\n"
);

// Colors for terminal output
const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bright: "\x1b[1m",
};

const log = (message, color = "reset") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const step = (number, title) => {
  log(`\n${colors.bright}📋 Step ${number}: ${title}${colors.reset}`, "blue");
};

try {
  step(1, "Checking Node.js version");
  const nodeVersion = process.version;
  log(`✅ Node.js version: ${nodeVersion}`, "green");

  if (parseInt(nodeVersion.slice(1)) < 16) {
    log("❌ Node.js 16 or higher is required!", "red");
    process.exit(1);
  }

  step(2, "Creating environment files");

  // Create backend .env if it doesn't exist
  const backendEnvPath = path.join(__dirname, ".env");
  if (!fs.existsSync(backendEnvPath)) {
    const backendEnvContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database (MongoDB)
MONGODB_URI=mongodb://localhost:27017/ai-exam-checker

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-for-hackathon-demo

# OpenAI API (add your key here)
OPENAI_API_KEY=your-openai-api-key-here

# Client URL for CORS
CLIENT_URL=http://localhost:5173

# Demo Mode (enables fallback to demo data)
DEMO_MODE=true
`;
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    log("✅ Created backend .env file", "green");
  } else {
    log("✅ Backend .env file already exists", "yellow");
  }

  // Create frontend .env if it doesn't exist
  const frontendEnvPath = path.join(__dirname, "client", ".env");
  if (!fs.existsSync(frontendEnvPath)) {
    const frontendEnvContent = `VITE_API_URL=http://localhost:5000/api
`;
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    log("✅ Created frontend .env file", "green");
  } else {
    log("✅ Frontend .env file already exists", "yellow");
  }

  step(3, "Installing dependencies");
  log("📦 Installing backend dependencies...", "blue");
  execSync("npm install", { stdio: "inherit" });

  log("📦 Installing frontend dependencies...", "blue");
  execSync("cd client && npm install --legacy-peer-deps", { stdio: "inherit" });

  log("✅ All dependencies installed successfully!", "green");

  step(4, "Setup complete!");
  log("🎉 AI Exam Readiness Checker is ready to run!", "green");

  console.log(`\n${colors.bright}🚀 Quick Start Commands:${colors.reset}`);
  console.log(
    `${colors.blue}npm run dev${colors.reset}     - Start both frontend and backend`
  );
  console.log(
    `${colors.blue}npm run server${colors.reset}  - Start backend only`
  );
  console.log(
    `${colors.blue}npm run client${colors.reset}  - Start frontend only\n`
  );

  console.log(`${colors.bright}🌐 URLs:${colors.reset}`);
  console.log(`Frontend: ${colors.green}http://localhost:5173${colors.reset}`);
  console.log(
    `Backend:  ${colors.green}http://localhost:5000${colors.reset}\n`
  );

  console.log(`${colors.bright}📚 For Hackathon Judges:${colors.reset}`);
  console.log(`• The app works with demo data even without OpenAI API key`);
  console.log(`• MongoDB is optional - demo data is used as fallback`);
  console.log(`• Try the interactive demo quiz on the homepage`);
  console.log(`• Full source code available with detailed comments\n`);

  console.log(
    `${colors.bright}🏆 Panda Hacks 2025 - Built for students, by students${colors.reset}`
  );
} catch (error) {
  log(`❌ Setup failed: ${error.message}`, "red");
  log("\n💡 Manual setup steps:", "yellow");
  log("1. Run: npm install", "yellow");
  log("2. Run: cd client && npm install --legacy-peer-deps", "yellow");
  log("3. Create .env files as shown in README.md", "yellow");
  log("4. Run: npm run dev", "yellow");
  process.exit(1);
}
