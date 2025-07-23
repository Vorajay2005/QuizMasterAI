/**
 * Grading utilities for consistent grade calculation across the application
 */

/**
 * Convert percentage score to letter grade using simple A, B, C, D, F scale
 * @param {number} percentage - Score percentage (0-100)
 * @returns {string} Letter grade (A, B, C, D, F)
 */
function getLetterGrade(percentage, totalQuestions = null) {
  // Ensure percentage is a valid number
  const score = Math.round(Number(percentage) || 0);

  // If we have total questions, use adaptive grading
  if (totalQuestions && totalQuestions <= 10) {
    return getAdaptiveGrade(score, totalQuestions);
  }

  // Default percentage-based grading for larger quizzes
  if (score >= 90) return "A"; // 90-100%
  if (score >= 80) return "B"; // 80-89%
  if (score >= 70) return "C"; // 70-79%
  if (score >= 60) return "D"; // 60-69%
  return "F"; // Below 60%
}

/**
 * Adaptive grading based on number of questions
 * More forgiving for quizzes with fewer questions
 */
function getAdaptiveGrade(percentage, totalQuestions) {
  if (totalQuestions <= 3) {
    // For 1-3 questions: Very forgiving
    if (percentage >= 100) return "A"; // 3/3, 2/2, 1/1
    if (percentage >= 67) return "B"; // 2/3
    if (percentage >= 33) return "C"; // 1/3
    return "F"; // 0/3, 0/2, 0/1
  } else if (totalQuestions <= 5) {
    // For 4-5 questions: Moderately forgiving
    if (percentage >= 90) return "A"; // 5/5, 4/4 (90%+)
    if (percentage >= 80) return "B"; // 4/5 (80%)
    if (percentage >= 60) return "C"; // 3/5 (60%)
    if (percentage >= 40) return "D"; // 2/5 (40%)
    return "F"; // 1/5, 0/5
  } else if (totalQuestions <= 10) {
    // For 6-10 questions: Standard but slightly forgiving
    if (percentage >= 90) return "A"; // 90%+
    if (percentage >= 75) return "B"; // 75%+
    if (percentage >= 60) return "C"; // 60%+
    if (percentage >= 45) return "D"; // 45%+
    return "F"; // Below 45%
  }

  // Default for larger quizzes
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
}

/**
 * Get grade color class for UI display
 * @param {string} grade - Letter grade
 * @returns {string} CSS color class
 */
function getGradeColor(grade) {
  if (grade === "A") return "text-green-600";
  if (grade === "B") return "text-blue-600";
  if (grade === "C") return "text-yellow-600";
  if (grade === "D") return "text-orange-600";
  return "text-red-600"; // F
}

/**
 * Get grade description
 * @param {string} grade - Letter grade
 * @returns {string} Grade description
 */
function getGradeDescription(grade) {
  const descriptions = {
    A: "Excellent",
    B: "Good",
    C: "Average",
    D: "Poor",
    F: "Failing",
  };
  return descriptions[grade] || "Unknown";
}

/**
 * Calculate percentage from score and total
 * @param {number} score - Number of correct answers
 * @param {number} total - Total number of questions
 * @returns {number} Percentage (0-100)
 */
function calculatePercentage(score, total) {
  if (!total || total === 0) return 0;
  return Math.round((Number(score) / Number(total)) * 100);
}

/**
 * Get comprehensive grade info
 * @param {number} score - Number of correct answers
 * @param {number} total - Total number of questions
 * @returns {object} Grade information object
 */
function getGradeInfo(score, total) {
  const percentage = calculatePercentage(score, total);
  const letterGrade = getLetterGrade(percentage, Number(total));

  return {
    score: Number(score) || 0,
    total: Number(total) || 0,
    percentage,
    letterGrade,
    color: getGradeColor(letterGrade),
    description: getGradeDescription(letterGrade),
    isPassing: percentage >= 60,
  };
}

module.exports = {
  getLetterGrade,
  getGradeColor,
  getGradeDescription,
  calculatePercentage,
  getGradeInfo,
};
