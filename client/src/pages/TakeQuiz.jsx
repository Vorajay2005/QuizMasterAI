import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  AlertCircle,
  Play,
  BarChart3,
} from "lucide-react";
import Confetti from "react-confetti";
import toast from "react-hot-toast";

import useQuizStore from "../store/quizStore";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  formatTime,
  calculatePercentage,
  getScoreColor,
  getGrade,
} from "../utils/helpers";

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    currentQuiz,
    currentQuestionIndex,
    userAnswers,
    currentAttempt,
    isLoading,
    getQuiz,
    startQuiz,
    setAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitQuiz,
    isQuizComplete,
    resetQuiz,
  } = useQuizStore();

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }

    return () => {
      resetQuiz();
    };
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (
      isStarted &&
      currentQuiz?.settings?.timeLimit &&
      timeLeft > 0 &&
      !showResults
    ) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStarted, timeLeft, showResults]);

  const loadQuiz = async () => {
    const result = await getQuiz(quizId);
    if (result.success) {
      const timeLimit = result.data.quiz.settings?.timeLimit;
      if (timeLimit) {
        setTimeLeft(timeLimit * 60); // Convert minutes to seconds
      }
    } else {
      toast.error("Quiz not found");
      navigate("/dashboard");
    }
  };

  const handleStart = () => {
    if (currentQuiz) {
      startQuiz(currentQuiz);
      setIsStarted(true);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswer(questionId, answer);
  };

  const handleSubmit = async () => {
    try {
      if (!isQuizComplete()) {
        const unansweredCount =
          currentQuiz.questions.length - Object.keys(userAnswers).length;
        if (
          !confirm(
            `You have ${unansweredCount} unanswered questions. Submit anyway?`
          )
        ) {
          return;
        }
      }

      console.log("🚀 Starting quiz submission...");
      const result = await submitQuiz();
      console.log("📊 Quiz submission result:", result);

      if (result.success) {
        console.log("✅ Quiz submission successful, processing results...");
        setShowResults(true);

        // Safely access percentage with fallback
        const percentage = result.data?.attempt?.percentage || 0;
        console.log("📈 Quiz percentage:", percentage);

        // Show confetti for good scores
        if (percentage >= 80) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }

        // Enhanced success message for practice quizzes
        if (result.data?.isPracticeQuiz && result.data?.savedToDashboard) {
          toast.success(
            `🎯 Practice quiz completed! Score: ${percentage}% - Saved to your dashboard!`,
            {
              duration: 4000,
            }
          );
        } else if (result.data?.isDemo) {
          toast.success(
            `Demo quiz completed! Score: ${percentage}% - Sign up to save your progress!`
          );
        } else {
          toast.success(`Quiz completed! Score: ${percentage}%`);
        }
      } else {
        console.error("❌ Quiz submission failed:", result.error);
        toast.error(result.error || "Failed to submit quiz");
      }
    } catch (error) {
      console.error("🚨 Error in handleSubmit:", error);
      toast.error("An unexpected error occurred while submitting the quiz");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading quiz..." />
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The quiz you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Quiz start screen
  if (!isStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-2xl w-full mx-4"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Play className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 font-display mb-2">
              {currentQuiz.title}
            </h1>

            <p className="text-gray-600 mb-8">
              {currentQuiz.description ||
                `${currentQuiz.subject} quiz with ${currentQuiz.questions.length} questions`}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {currentQuiz.questions.length}
                </div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {currentQuiz.settings?.timeLimit || "∞"}
                </div>
                <div className="text-sm text-gray-600">
                  {currentQuiz.settings?.timeLimit ? "Minutes" : "No limit"}
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600 mb-1 capitalize">
                  {currentQuiz.difficulty}
                </div>
                <div className="text-sm text-gray-600">Difficulty</div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Cancel
              </Button>
              <Button onClick={handleStart} size="lg">
                Start Quiz
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Results screen
  if (showResults && currentAttempt) {
    const percentage = currentAttempt.percentage;
    const grade = getGrade(percentage, currentQuiz?.questions?.length);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {showConfetti && <Confetti />}

        <div className="section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <h1 className="text-4xl font-bold text-gray-900 font-display mb-2">
                Quiz Completed!
              </h1>
              <p className="text-gray-600">Great job on finishing the quiz</p>
            </div>

            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="card text-center mb-8"
            >
              <div
                className={`text-6xl font-bold mb-4 ${getScoreColor(
                  percentage
                )}`}
              >
                {percentage}%
              </div>
              <div className="text-2xl font-semibold text-gray-900 mb-2">
                Grade: {grade}
              </div>
              <div className="text-gray-600">
                {currentAttempt.score} out of {currentAttempt.totalQuestions}{" "}
                questions correct
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Summary */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="card"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Performance Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Questions:</span>
                    <span className="font-medium">
                      {currentAttempt.totalQuestions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Correct Answers:</span>
                    <span className="font-medium text-success-600">
                      {currentAttempt.score}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Incorrect Answers:</span>
                    <span className="font-medium text-error-600">
                      {currentAttempt.totalQuestions - currentAttempt.score}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Spent:</span>
                    <span className="font-medium">
                      {Math.floor(currentAttempt.timeSpent / 60)}m{" "}
                      {currentAttempt.timeSpent % 60}s
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Feedback */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="card"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Feedback & Areas to Improve
                </h3>

                {currentAttempt.feedback?.weaknesses?.length > 0 ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">
                        Areas to Focus:
                      </h4>
                      <ul className="space-y-1">
                        {currentAttempt.feedback.weaknesses.map(
                          (weakness, index) => (
                            <li
                              key={index}
                              className="text-gray-600 flex items-center"
                            >
                              <div className="w-2 h-2 bg-orange-400 rounded-full mr-2" />
                              {weakness}
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {currentAttempt.feedback.recommendations?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">
                          Recommendations:
                        </h4>
                        <ul className="space-y-1">
                          {currentAttempt.feedback.recommendations.map(
                            (rec, index) => (
                              <li
                                key={index}
                                className="text-gray-600 flex items-center"
                              >
                                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                                {rec}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Excellent work! Keep up the great study habits.
                  </p>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-8 space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate("/analytics")}
                >
                  <BarChart3 className="mr-2" size={18} />
                  View Analytics
                </Button>
                <Button onClick={() => navigate("/create-quiz")}>
                  Create Another Quiz
                </Button>
              </div>

              <Button variant="link" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz taking interface
  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="glass-effect border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {currentQuiz.title}
              </h1>
              <span className="badge badge-primary">
                Question {currentQuestionIndex + 1} of{" "}
                {currentQuiz.questions.length}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {timeLeft !== null && (
                <div
                  className={`flex items-center space-x-2 ${
                    timeLeft < 300 ? "text-error-600" : "text-gray-600"
                  }`}
                >
                  <Clock size={20} />
                  <span className="font-medium">{formatTime(timeLeft)}</span>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleSubmit}
                disabled={answeredCount === 0}
              >
                <Flag className="mr-2" size={16} />
                Submit ({answeredCount}/{currentQuiz.questions.length})
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar mt-4">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <div className="section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Question Navigation */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {currentQuiz.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        index === currentQuestionIndex
                          ? "bg-primary-600 text-white"
                          : userAnswers[currentQuiz.questions[index]._id]
                          ? "bg-success-100 text-success-800"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 bg-success-100 rounded"></div>
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 bg-primary-600 rounded"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div>
                    <span>Not answered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="quiz-question-card"
              >
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="badge badge-primary">
                      {currentQuestion.type.toUpperCase()}
                    </span>
                    <span className="badge badge-warning">
                      {currentQuestion.difficulty}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {currentQuestion.question}
                  </h2>
                </div>

                {/* Answer Options */}
                <div className="space-y-3 mb-8">
                  {currentQuestion.type === "mcq" ? (
                    currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          handleAnswerSelect(currentQuestion._id, option)
                        }
                        className={`quiz-option ${
                          userAnswers[currentQuestion._id]?.answer === option
                            ? "quiz-option-selected"
                            : ""
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3 text-sm font-medium">
                            {String.fromCharCode(65 + index)}
                          </span>
                          {option}
                        </div>
                      </button>
                    ))
                  ) : (
                    <textarea
                      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-32"
                      placeholder={
                        currentQuestion.type === "fillblank"
                          ? "Fill in the blank..."
                          : "Type your answer here..."
                      }
                      value={userAnswers[currentQuestion._id]?.answer || ""}
                      onChange={(e) =>
                        handleAnswerSelect(currentQuestion._id, e.target.value)
                      }
                    />
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="mr-2" size={18} />
                    Previous
                  </Button>

                  {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
                    <Button onClick={handleSubmit} variant="success">
                      Submit Quiz
                      <Flag className="ml-2" size={18} />
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion}>
                      Next
                      <ChevronRight className="ml-2" size={18} />
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
