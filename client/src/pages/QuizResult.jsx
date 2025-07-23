import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  Award,
  Calendar,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";

import useAuthStore from "../store/authStore";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  formatDate,
  getScoreColor,
  getGrade,
  getTopicIcon,
} from "../utils/helpers";
import axiosInstance from "../utils/axios";

const QuizResult = () => {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchAttemptDetails = async () => {
      try {
        const response = await axiosInstance.get(`/quiz/attempt/${attemptId}`);
        if (response.data.success) {
          setAttempt(response.data.data);
        } else {
          toast.error("Failed to load quiz result");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching attempt details:", error);
        toast.error("Failed to load quiz result");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (attemptId) {
      fetchAttemptDetails();
    }
  }, [attemptId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Quiz result not found</p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const quizTitle = attempt.isPracticeQuiz
    ? `${attempt.quizTitle} - ${attempt.subject} Quiz`
    : attempt.quizId?.title
    ? `${attempt.quizId.title} - ${attempt.quizId.subject} Quiz`
    : "Quiz";

  const subject = attempt.isPracticeQuiz
    ? attempt.subject
    : attempt.quizId?.subject;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate("/quiz-attempts")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back to All Attempts</span>
            </Button>
          </div>
        </div>

        {/* Quiz Result Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-8 mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
              {getTopicIcon(subject)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quizTitle}</h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>{formatDate(attempt.completedAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>{Math.round(attempt.timeSpent / 60)} minutes</span>
                </div>
                <span className="font-medium text-blue-600">{subject}</span>
              </div>
            </div>
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div
                className={`text-3xl font-bold ${getScoreColor(
                  attempt.percentage
                )}`}
              >
                {attempt.percentage || 0}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Overall Score</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {attempt.score || 0}/{attempt.totalQuestions || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Score</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {attempt.score || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Correct</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">
                {(attempt.totalQuestions || 0) - (attempt.score || 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Incorrect</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div
                className={`text-3xl font-bold ${getScoreColor(
                  attempt.percentage
                )}`}
              >
                {getGrade(attempt.percentage || 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Grade</div>
            </div>
          </div>
        </motion.div>

        {/* Questions and Answers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <BookOpen size={20} />
              <span>Question Review</span>
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {attempt.answers?.map((answer, index) => {
              const question = attempt.isPracticeQuiz
                ? attempt.questions?.find((q) => q._id === answer.questionId)
                : attempt.quizId?.questions?.find(
                    (q) => q._id === answer.questionId
                  );

              if (!question) return null;

              const isCorrect = answer.isCorrect;

              return (
                <motion.div
                  key={answer.questionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCorrect
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm font-medium text-gray-500">
                          Question {index + 1}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isCorrect
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                        {answer.timeSpent && (
                          <span className="text-xs text-gray-500">
                            {Math.round(answer.timeSpent)}s
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {question.question}
                      </h3>

                      {question.type === "mcq" && (
                        <div className="space-y-2">
                          {question.options?.map((option, optionIndex) => {
                            const isUserAnswer = answer.answer === option;
                            const isCorrectAnswer =
                              question.correctAnswer === option;

                            return (
                              <div
                                key={optionIndex}
                                className={`p-3 rounded-lg border ${
                                  isCorrectAnswer
                                    ? "bg-green-50 border-green-200"
                                    : isUserAnswer && !isCorrectAnswer
                                    ? "bg-red-50 border-red-200"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-700">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  <span className="text-gray-900">
                                    {option}
                                  </span>
                                  {isCorrectAnswer && (
                                    <CheckCircle
                                      size={16}
                                      className="text-green-600"
                                    />
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <XCircle
                                      size={16}
                                      className="text-red-600"
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {question.type !== "mcq" && (
                        <div className="space-y-3">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              Your Answer:
                            </div>
                            <div className="text-gray-900">{answer.answer}</div>
                          </div>

                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              Correct Answer:
                            </div>
                            <div className="text-gray-900">
                              {question.correctAnswer}
                            </div>
                          </div>
                        </div>
                      )}

                      {question.explanation && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-900 mb-2">
                            Explanation:
                          </div>
                          <div className="text-blue-800">
                            {question.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button variant="outline" onClick={() => navigate("/quiz-attempts")}>
            View All Attempts
          </Button>
          <Button onClick={() => navigate("/browse")}>Take Another Quiz</Button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
