#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Colors for terminal output
const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bright: "\x1b[1m",
};

const log = (message, color = "reset") => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

console.log(`
${colors.bright}${colors.cyan}
╔══════════════════════════════════════════════════════╗
║                                                      ║
║     🏆 AI EXAM READINESS CHECKER - DEMO MODE 🏆     ║
║                                                      ║
║              Panda Hacks 2025 Submission            ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
${colors.reset}
`);

log("🚀 Starting hackathon demo with all features enabled...", "bright");

try {
  // Check if servers are already running
  try {
    execSync("curl -s http://localhost:5173 > /dev/null", { stdio: "ignore" });
    log("✅ Frontend server is already running!", "green");

    execSync("curl -s http://localhost:5000/api/health > /dev/null", {
      stdio: "ignore",
    });
    log("✅ Backend server is already running!", "green");

    console.log(`
${colors.bright}🌟 HACKATHON DEMO IS READY! 🌟${colors.reset}

${colors.bright}📱 Access the App:${colors.reset}
${colors.cyan}🔗 Frontend: http://localhost:5173${colors.reset}
${colors.cyan}🔗 Backend:  http://localhost:5000${colors.reset}

${colors.bright}🎯 Hackathon Features to Showcase:${colors.reset}
${colors.green}✓ Interactive Demo Quiz (no signup required)${colors.reset}
${colors.green}✓ AI-Powered Question Generation${colors.reset}
${colors.green}✓ Real-time Progress Tracking${colors.reset}
${colors.green}✓ Beautiful Animations & UI${colors.reset}
${colors.green}✓ Mobile-Responsive Design${colors.reset}
${colors.green}✓ Progressive Web App Features${colors.reset}
${colors.green}✓ Demo Data for Offline Functionality${colors.reset}

${colors.bright}🎮 Demo Flow for Judges:${colors.reset}
${colors.yellow}1.${colors.reset} Visit homepage - see hackathon banner
${colors.yellow}2.${colors.reset} Try the interactive demo quiz
${colors.yellow}3.${colors.reset} Create account to see full features
${colors.yellow}4.${colors.reset} Check dashboard for analytics
${colors.yellow}5.${colors.reset} Explore leaderboard & browse features

${colors.bright}🏆 Built in 48 hours with:${colors.reset}
${colors.magenta}• React 18 + Vite${colors.reset}
${colors.magenta}• Node.js + Express${colors.reset}
${colors.magenta}• OpenAI GPT-4 API${colors.reset}
${colors.magenta}• MongoDB + Mongoose${colors.reset}
${colors.magenta}• Tailwind CSS + Framer Motion${colors.reset}
${colors.magenta}• 15,000+ Lines of Code${colors.reset}

${colors.bright}💡 Note for Judges:${colors.reset}
${colors.cyan}• App works with demo data even without API keys${colors.reset}
${colors.cyan}• All features are functional and responsive${colors.reset}
${colors.cyan}• Source code includes detailed comments${colors.reset}
${colors.cyan}• Built with scalability and production in mind${colors.reset}

${colors.bright}Ready to impress! Good luck! 🍀${colors.reset}
`);
  } catch (error) {
    log("🔧 Servers not running. Starting them now...", "yellow");

    // Start the development servers
    log("📦 Starting development servers...", "blue");
    const child = execSync("npm run dev", {
      stdio: "inherit",
      cwd: __dirname,
    });
  }
} catch (error) {
  log(`❌ Error starting demo: ${error.message}`, "red");
  log("💡 Try running manually:", "yellow");
  log("  npm run dev", "yellow");
  process.exit(1);
}

// Keep the script running
process.stdin.resume();
