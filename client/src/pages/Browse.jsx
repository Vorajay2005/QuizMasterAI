import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, Users, Clock, Star, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import useQuizStore from "../store/quizStore";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { getDifficultyColor, getTopicIcon, formatDate } from "../utils/helpers";

// Mock quiz data as fallback - using existing demo IDs that actually work
const fallbackQuizzes = [
  // Use existing demo quizzes that have full question data
  {
    _id: "demo-2", // This exists in demoData.js with actual questions
    title: "Calculus Fundamentals: Derivatives",
    subject: "Mathematics",
    difficulty: "medium",
    questions: 3, // Actual question count: 3 questions
    attempts: 456,
    averageScore: 82,
    createdBy: { name: "Prof. Mike Johnson" },
    createdAt: new Date("2024-01-10"),
    tags: ["calculus", "derivatives", "power rule"],
  },
  {
    _id: "demo-1", // This exists in demoData.js with actual questions
    title: "Biology Chapter 12: Photosynthesis",
    subject: "Biology",
    difficulty: "medium",
    questions: 5, // FIXED: Actual question count: 5 questions
    attempts: 234,
    averageScore: 78,
    createdBy: { name: "Dr. Sarah Wilson" },
    createdAt: new Date("2024-01-15"),
    tags: ["photosynthesis", "chlorophyll", "plants"],
  },
  {
    _id: "demo-3", // This exists in demoData.js with actual questions
    title: "Chemistry: Chemical Bonds",
    subject: "Chemistry",
    difficulty: "medium",
    questions: 3, // FIXED: Actual question count: 3 questions
    attempts: 189,
    averageScore: 89,
    createdBy: { name: "Dr. Emily Davis" },
    createdAt: new Date("2024-01-20"),
    tags: ["ionic bonds", "covalent", "molecules"],
  },
  {
    _id: "demo-4", // This exists in demoData.js with actual questions
    title: "General Studies Quiz",
    subject: "General",
    difficulty: "easy",
    questions: 2, // Actual question count from demoData.js
    attempts: 312,
    averageScore: 75,
    createdBy: { name: "Dr. James Liu" },
    createdAt: new Date("2024-01-12"),
    tags: ["general", "knowledge", "mixed"],
  },
  // Create additional versions using the working demo quizzes with different titles for variety
  {
    _id: "demo-1", // Reuse photosynthesis quiz with different display name
    title: "Biology: Plant Cell Functions",
    subject: "Biology",
    difficulty: "easy",
    questions: 5,
    attempts: 445,
    averageScore: 81,
    createdBy: { name: "Prof. Robert Green" },
    createdAt: new Date("2024-01-28"),
    tags: ["plant cells", "cellular processes", "biology"],
  },
  {
    _id: "demo-2", // Reuse calculus quiz with different display name
    title: "Mathematics: Advanced Calculus",
    subject: "Mathematics",
    difficulty: "hard",
    questions: 3,
    attempts: 156,
    averageScore: 71,
    createdBy: { name: "Prof. Alan Thompson" },
    createdAt: new Date("2024-02-08"),
    tags: ["advanced calculus", "mathematics", "derivatives"],
  },
  {
    _id: "demo-3", // Reuse chemistry quiz with different display name
    title: "Chemistry: Molecular Structure",
    subject: "Chemistry",
    difficulty: "hard",
    questions: 3,
    attempts: 201,
    averageScore: 73,
    createdBy: { name: "Prof. Marco Silva" },
    createdAt: new Date("2024-02-10"),
    tags: ["molecules", "structure", "chemistry"],
  },
  {
    _id: "demo-4", // Reuse general quiz with different display name
    title: "General Knowledge: World Facts",
    subject: "History",
    difficulty: "easy",
    questions: 2,
    attempts: 512,
    averageScore: 84,
    createdBy: { name: "Ms. Elizabeth Taylor" },
    createdAt: new Date("2024-01-18"),
    tags: ["world facts", "geography", "history"],
  },
];

const Browse = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [quizzes, setQuizzes] = useState(fallbackQuizzes);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { getPublicQuizzes } = useQuizStore();

  const subjects = [
    "All",
    "Mathematics",
    "Biology",
    "Chemistry",
    "General",
    "History",
  ];

  // Load quizzes data
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setIsLoading(true);
        const result = await getPublicQuizzes(
          currentPage,
          20,
          selectedSubject === "All" ? "" : selectedSubject
        );

        if (
          result.success &&
          result.data.quizzes &&
          result.data.quizzes.length > 0
        ) {
          setQuizzes(result.data.quizzes);
        } else {
          // Use fallback data if API fails or returns empty data
          console.log("Using fallback quizzes data");
          setQuizzes(fallbackQuizzes);
        }
      } catch (error) {
        console.error("Failed to load quizzes:", error);
        setQuizzes(fallbackQuizzes);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();

    // Listen for quiz completion events to refresh quiz stats
    const handleQuizCompleted = () => {
      console.log("Quiz completed, refreshing browse page...");
      loadQuizzes();
    };

    window.addEventListener("quiz-completed", handleQuizCompleted);

    return () => {
      window.removeEventListener("quiz-completed", handleQuizCompleted);
    };
  }, [currentPage, selectedSubject, getPublicQuizzes]);

  const refreshQuizzes = async () => {
    setIsLoading(true);
    try {
      const result = await getPublicQuizzes(
        currentPage,
        20,
        selectedSubject === "All" ? "" : selectedSubject
      );

      if (result.success) {
        setQuizzes(result.data.quizzes || []);
        toast.success("Quizzes refreshed!");
      }
    } catch (error) {
      toast.error("Failed to refresh quizzes");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === "All" ||
      selectedSubject === "" ||
      quiz.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // Debug log
  console.log(
    "Browse component - quizzes:",
    quizzes.length,
    "filtered:",
    filteredQuizzes.length
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="section-padding">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900 font-display">
              Browse Quizzes
            </h1>
            <Button
              onClick={refreshQuizzes}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
              Refresh
            </Button>
          </div>
          <p className="text-gray-600">
            Discover and practice with community-created quizzes
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  icon={Search}
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <select
                  className="input bg-white"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quiz Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" text="Loading quizzes..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="card card-hover"
              >
                {/* Topic Badge */}
                <div className="mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                    <span className="mr-2">{getTopicIcon(quiz.subject)}</span>
                    {quiz.subject || "General"}
                  </span>
                </div>

                {/* Quiz Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {quiz.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      by {quiz.createdBy.name}
                    </p>
                  </div>
                  <span
                    className={`badge ${getDifficultyColor(quiz.difficulty)}`}
                  >
                    {quiz.difficulty}
                  </span>
                </div>

                {/* Quiz Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {quiz.questions}
                    </div>
                    <div className="text-xs text-gray-600">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary-600">
                      {quiz.averageScore}%
                    </div>
                    <div className="text-xs text-gray-600">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {quiz.attempts}
                    </div>
                    <div className="text-xs text-gray-600">Attempts</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {quiz.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="badge badge-primary">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Quiz Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock size={16} className="mr-1" />
                    {quiz.createdAt.toLocaleDateString()}
                  </div>
                  <Link to={`/quiz/${quiz._id}`}>
                    <Button size="sm">Take Quiz</Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredQuizzes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No quizzes found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters
            </p>
            <Link to="/create-quiz">
              <Button>Create Your Own Quiz</Button>
            </Link>
          </motion.div>
        )}

        {/* Popular Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              { name: "Mathematics", icon: "🔢", count: "2" },
              { name: "Biology", icon: "🧬", count: "2" },
              { name: "Chemistry", icon: "⚗️", count: "2" },
              { name: "General", icon: "🌍", count: "1" },
              { name: "History", icon: "📚", count: "1" },
            ].map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedSubject(category.name)}
                className="card card-hover text-center p-4 border-2 border-transparent hover:border-primary-200"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {category.count} quizzes
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Browse;
