import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind CSS utility function
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format time in MM:SS format
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

// Calculate percentage
export function calculatePercentage(score, total) {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
}

// Format date for display
export function formatDate(date) {
  const now = new Date();
  const inputDate = new Date(date);
  const diffTime = Math.abs(now - inputDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "Today";
  } else if (diffDays === 2) {
    return "Yesterday";
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return inputDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        inputDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

// Get difficulty color
export function getDifficultyColor(difficulty) {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "badge-success";
    case "medium":
      return "badge-warning";
    case "hard":
      return "badge-error";
    case "adaptive":
      return "badge-primary";
    default:
      return "badge-primary";
  }
}

// Get score color based on percentage
export function getScoreColor(percentage) {
  if (percentage >= 90) return "text-success-600";
  if (percentage >= 70) return "text-warning-600";
  if (percentage >= 50) return "text-orange-600";
  return "text-error-600";
}

// Get grade based on score
export function getGrade(percentage) {
  if (percentage >= 97) return "A+";
  if (percentage >= 93) return "A";
  if (percentage >= 90) return "A-";
  if (percentage >= 87) return "B+";
  if (percentage >= 83) return "B";
  if (percentage >= 80) return "B-";
  if (percentage >= 77) return "C+";
  if (percentage >= 73) return "C";
  if (percentage >= 70) return "C-";
  if (percentage >= 67) return "D+";
  if (percentage >= 65) return "D";
  return "F";
}

// Shuffle array (Fisher-Yates algorithm)
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Validate email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate random color for avatars
export function generateAvatarColor(name) {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

// Get initials from name
export function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Get topic-specific icon
export function getTopicIcon(subject) {
  const topic = subject?.toLowerCase() || "";

  // Math & Sciences
  if (
    topic.includes("math") ||
    topic.includes("calculus") ||
    topic.includes("algebra") ||
    topic.includes("geometry") ||
    topic.includes("trigonometry")
  )
    return "📐";
  if (
    topic.includes("biology") ||
    topic.includes("bio") ||
    topic.includes("life science")
  )
    return "🧬";
  if (topic.includes("chemistry") || topic.includes("chem")) return "⚗️";
  if (topic.includes("physics")) return "⚛️";
  if (topic.includes("statistics") || topic.includes("data")) return "📊";

  // Humanities
  if (topic.includes("history") || topic.includes("historical")) return "📜";
  if (
    topic.includes("english") ||
    topic.includes("literature") ||
    topic.includes("writing")
  )
    return "📖";
  if (topic.includes("geography") || topic.includes("geo")) return "🌍";
  if (topic.includes("philosophy")) return "🤔";
  if (topic.includes("psychology") || topic.includes("psych")) return "🧠";
  if (topic.includes("sociology")) return "👥";

  // Languages
  if (
    topic.includes("spanish") ||
    topic.includes("french") ||
    topic.includes("german") ||
    topic.includes("language")
  )
    return "🌐";

  // Technology & Business
  if (
    topic.includes("computer") ||
    topic.includes("programming") ||
    topic.includes("coding") ||
    topic.includes("software")
  )
    return "💻";
  if (
    topic.includes("economics") ||
    topic.includes("business") ||
    topic.includes("finance")
  )
    return "📈";

  // Arts & Others
  if (
    topic.includes("art") ||
    topic.includes("drawing") ||
    topic.includes("painting")
  )
    return "🎨";
  if (topic.includes("music")) return "🎵";
  if (topic.includes("drama") || topic.includes("theater")) return "🎭";
  if (topic.includes("health") || topic.includes("medical")) return "🏥";
  if (topic.includes("law") || topic.includes("legal")) return "⚖️";

  // Default
  return "📚";
}

// Parse quiz content and extract topics
export function extractTopics(content) {
  const lines = content.split("\n").filter((line) => line.trim());
  const topics = [];

  lines.forEach((line) => {
    // Look for lines that might be headers/topics (all caps, short, etc.)
    if (line.length < 50 && line.includes(":")) {
      const topic = line.split(":")[0].trim();
      if (topic.length > 2) {
        topics.push(topic);
      }
    }
  });

  return [...new Set(topics)]; // Remove duplicates
}

// Estimate reading time
export function estimateReadingTime(text) {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes;
}

// Local storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },
};

// Copy to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

// Download data as JSON file
export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
