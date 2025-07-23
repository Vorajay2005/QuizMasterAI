import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

import useAuthStore from "../store/authStore";
import useQuizStore from "../store/quizStore";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  formatDate,
  getScoreColor,
  getGrade,
  getTopicIcon,
} from "../utils/helpers";

const QuizAttempts = () => {
  const [allAttempts, setAllAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const attemptsPerPage = 10;

  const { user } = useAuthStore();
  const { getUserAttempts } = useQuizStore();
  const navigate = useNavigate();

  const loadAllAttempts = async () => {
    setIsLoading(true);
    try {
      // Load all attempts by requesting a large number
      const result = await getUserAttempts(1, 1000); // Get up to 1000 attempts
      if (result.success) {
        setAllAttempts(result.data.attempts);
      } else {
        toast.error("Failed to load quiz attempts");
      }
    } catch (error) {
      console.error("Error loading attempts:", error);
      toast.error("Failed to load quiz attempts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllAttempts();
  }, []);

  const handleAttemptClick = (attemptId) => {
    navigate(`/quiz-result/${attemptId}`);
  };

  const filteredAttempts = allAttempts.filter((attempt) => {
    const matchesSearch =
      searchTerm === "" ||
      (attempt.isPracticeQuiz
        ? attempt.quizTitle?.toLowerCase().includes(searchTerm.toLowerCase())
        : attempt.quizId?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()));

    const matchesSubject =
      filterSubject === "" ||
      (attempt.isPracticeQuiz
        ? attempt.subject === filterSubject
        : attempt.quizId?.subject === filterSubject);

    return matchesSearch && matchesSubject;
  });

  // Calculate pagination for filtered results
  const totalPages = Math.ceil(filteredAttempts.length / attemptsPerPage);
  const startIndex = (currentPage - 1) * attemptsPerPage;
  const endIndex = startIndex + attemptsPerPage;
  const currentAttempts = filteredAttempts.slice(startIndex, endIndex);

  const subjects = [
    ...new Set(
      allAttempts
        .map((attempt) =>
          attempt.isPracticeQuiz ? attempt.subject : attempt.quizId?.subject
        )
        .filter(Boolean)
    ),
  ];

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSubject]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            All Quiz Attempts
          </h1>
          <p className="text-gray-600 mt-2">
            View all your quiz attempts and detailed results
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search quiz attempts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="sm:w-48">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quiz Attempts List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Quiz Attempts ({filteredAttempts.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {currentAttempts.length > 0 ? (
              currentAttempts.map((attempt, index) => (
                <motion.div
                  key={attempt._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAttemptClick(attempt._id)}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-xl">
                        {getTopicIcon(
                          attempt.isPracticeQuiz
                            ? attempt.subject
                            : attempt.quizId?.subject
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {attempt.isPracticeQuiz
                            ? `${attempt.quizTitle} - ${attempt.subject} Quiz`
                            : attempt.quizId?.title
                            ? `${attempt.quizId.title} - ${attempt.quizId.subject} Quiz`
                            : "Quiz"}
                        </h3>

                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{formatDate(attempt.completedAt)}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>
                              {Math.round(attempt.timeSpent / 60)} min
                            </span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Target size={14} />
                            <span>{attempt.totalQuestions} questions</span>
                          </div>

                          <span className="font-medium text-blue-600">
                            {attempt.isPracticeQuiz
                              ? attempt.subject
                              : attempt.quizId?.subject}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${getScoreColor(
                            attempt.percentage
                          )}`}
                        >
                          {attempt.percentage || 0}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {attempt.score || 0}/{attempt.totalQuestions || 0}{" "}
                          correct
                        </div>
                        <div
                          className={`text-sm font-medium ${getScoreColor(
                            attempt.percentage
                          )}`}
                        >
                          {getGrade(attempt.percentage || 0)}
                        </div>
                      </div>

                      <ChevronRight className="text-gray-400" size={20} />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center">
                <Target size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  {allAttempts.length === 0
                    ? "No quiz attempts found"
                    : "No quiz attempts match your search criteria"}
                </p>
                {allAttempts.length === 0 ? (
                  <Button onClick={() => navigate("/browse")}>
                    Take Your First Quiz
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterSubject("");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? "bg-primary-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAttempts;
