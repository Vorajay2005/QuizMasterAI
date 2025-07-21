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

// Mock quiz data as fallback - using proper demo IDs
const fallbackQuizzes = [
  // Mathematics Quizzes
  {
    _id: "math-1",
    title: "Algebra: Linear Equations",
    subject: "Mathematics",
    difficulty: "medium",
    questions: 12,
    attempts: 487,
    averageScore: 85,
    createdBy: { name: "Prof. Mike Johnson" },
    createdAt: new Date("2024-01-10"),
    tags: ["algebra", "linear equations", "solving for x"],
  },
  {
    _id: "math-2",
    title: "Calculus: Derivatives and Integrals",
    subject: "Mathematics",
    difficulty: "hard",
    questions: 15,
    attempts: 326,
    averageScore: 72,
    createdBy: { name: "Dr. Jennifer Smith" },
    createdAt: new Date("2024-01-22"),
    tags: ["calculus", "derivatives", "integrals"],
  },
  {
    _id: "math-3",
    title: "Geometry: Triangles and Angles",
    subject: "Mathematics",
    difficulty: "easy",
    questions: 10,
    attempts: 612,
    averageScore: 88,
    createdBy: { name: "Ms. Lisa Chen" },
    createdAt: new Date("2024-02-05"),
    tags: ["geometry", "triangles", "angles"],
  },

  // Biology Quizzes
  {
    _id: "bio-1",
    title: "Cell Biology: Structure and Function",
    subject: "Biology",
    difficulty: "medium",
    questions: 14,
    attempts: 398,
    averageScore: 79,
    createdBy: { name: "Dr. Sarah Wilson" },
    createdAt: new Date("2024-01-15"),
    tags: ["cell biology", "organelles", "cell membrane"],
  },
  {
    _id: "bio-2",
    title: "Photosynthesis and Cellular Respiration",
    subject: "Biology",
    difficulty: "medium",
    questions: 11,
    attempts: 445,
    averageScore: 81,
    createdBy: { name: "Prof. Robert Green" },
    createdAt: new Date("2024-01-28"),
    tags: ["photosynthesis", "respiration", "ATP"],
  },
  {
    _id: "bio-3",
    title: "Human Anatomy: Circulatory System",
    subject: "Biology",
    difficulty: "hard",
    questions: 16,
    attempts: 234,
    averageScore: 74,
    createdBy: { name: "Dr. Maria Rodriguez" },
    createdAt: new Date("2024-02-12"),
    tags: ["anatomy", "heart", "blood vessels"],
  },

  // Chemistry Quizzes
  {
    _id: "chem-1",
    title: "Chemical Bonding and Structure",
    subject: "Chemistry",
    difficulty: "medium",
    questions: 13,
    attempts: 367,
    averageScore: 83,
    createdBy: { name: "Dr. Emily Davis" },
    createdAt: new Date("2024-01-20"),
    tags: ["chemical bonds", "ionic", "covalent"],
  },
  {
    _id: "chem-2",
    title: "Organic Chemistry: Hydrocarbons",
    subject: "Chemistry",
    difficulty: "hard",
    questions: 18,
    attempts: 189,
    averageScore: 68,
    createdBy: { name: "Prof. David Kim" },
    createdAt: new Date("2024-02-03"),
    tags: ["organic", "hydrocarbons", "alkanes"],
  },
  {
    _id: "chem-3",
    title: "Acids and Bases",
    subject: "Chemistry",
    difficulty: "easy",
    questions: 9,
    attempts: 523,
    averageScore: 91,
    createdBy: { name: "Dr. Amanda White" },
    createdAt: new Date("2024-02-15"),
    tags: ["acids", "bases", "pH"],
  },

  // Physics Quizzes
  {
    _id: "phys-1",
    title: "Classical Mechanics: Forces and Motion",
    subject: "Physics",
    difficulty: "medium",
    questions: 12,
    attempts: 298,
    averageScore: 76,
    createdBy: { name: "Dr. Stephen Brown" },
    createdAt: new Date("2024-01-25"),
    tags: ["mechanics", "forces", "newton's laws"],
  },
  {
    _id: "phys-2",
    title: "Electromagnetic Waves",
    subject: "Physics",
    difficulty: "hard",
    questions: 14,
    attempts: 156,
    averageScore: 71,
    createdBy: { name: "Prof. Alan Thompson" },
    createdAt: new Date("2024-02-08"),
    tags: ["electromagnetic", "waves", "frequency"],
  },
  {
    _id: "phys-3",
    title: "Basic Thermodynamics",
    subject: "Physics",
    difficulty: "easy",
    questions: 8,
    attempts: 421,
    averageScore: 87,
    createdBy: { name: "Dr. Karen Lee" },
    createdAt: new Date("2024-02-18"),
    tags: ["thermodynamics", "heat", "temperature"],
  },

  // History Quizzes
  {
    _id: "hist-1",
    title: "World War II: Major Events",
    subject: "History",
    difficulty: "medium",
    questions: 15,
    attempts: 445,
    averageScore: 82,
    createdBy: { name: "Prof. Charles Miller" },
    createdAt: new Date("2024-01-12"),
    tags: ["world war 2", "wwii", "1940s"],
  },
  {
    _id: "hist-2",
    title: "American Civil War",
    subject: "History",
    difficulty: "medium",
    questions: 11,
    attempts: 378,
    averageScore: 79,
    createdBy: { name: "Dr. Nancy Adams" },
    createdAt: new Date("2024-01-30"),
    tags: ["civil war", "lincoln", "slavery"],
  },
  {
    _id: "hist-3",
    title: "Ancient Rome: Republic to Empire",
    subject: "History",
    difficulty: "hard",
    questions: 17,
    attempts: 201,
    averageScore: 73,
    createdBy: { name: "Prof. Marco Silva" },
    createdAt: new Date("2024-02-10"),
    tags: ["rome", "caesar", "empire"],
  },

  // English/Literature Quizzes
  {
    _id: "eng-1",
    title: "Shakespeare: Romeo and Juliet",
    subject: "English",
    difficulty: "medium",
    questions: 10,
    attempts: 512,
    averageScore: 84,
    createdBy: { name: "Ms. Elizabeth Taylor" },
    createdAt: new Date("2024-01-18"),
    tags: ["shakespeare", "romeo", "juliet"],
  },
  {
    _id: "eng-2",
    title: "Grammar and Punctuation",
    subject: "English",
    difficulty: "easy",
    questions: 12,
    attempts: 678,
    averageScore: 89,
    createdBy: { name: "Prof. John Wright" },
    createdAt: new Date("2024-02-01"),
    tags: ["grammar", "punctuation", "writing"],
  },
  {
    _id: "eng-3",
    title: "American Literature: 19th Century",
    subject: "English",
    difficulty: "hard",
    questions: 14,
    attempts: 267,
    averageScore: 75,
    createdBy: { name: "Dr. Susan Clark" },
    createdAt: new Date("2024-02-14"),
    tags: ["american literature", "19th century", "classics"],
  },

  // Computer Science Quizzes
  {
    _id: "cs-1",
    title: "Data Structures: Arrays and Lists",
    subject: "Computer Science",
    difficulty: "medium",
    questions: 13,
    attempts: 389,
    averageScore: 81,
    createdBy: { name: "Prof. Alex Zhang" },
    createdAt: new Date("2024-01-26"),
    tags: ["data structures", "arrays", "linked lists"],
  },
  {
    _id: "cs-2",
    title: "Object-Oriented Programming",
    subject: "Computer Science",
    difficulty: "hard",
    questions: 16,
    attempts: 245,
    averageScore: 77,
    createdBy: { name: "Dr. Rachel Kim" },
    createdAt: new Date("2024-02-06"),
    tags: ["OOP", "classes", "inheritance"],
  },
  {
    _id: "cs-3",
    title: "Basic Algorithms and Complexity",
    subject: "Computer Science",
    difficulty: "easy",
    questions: 9,
    attempts: 456,
    averageScore: 86,
    createdBy: { name: "Mr. Tom Anderson" },
    createdAt: new Date("2024-02-16"),
    tags: ["algorithms", "big o", "complexity"],
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
    "Physics",
    "History",
    "English",
    "Computer Science",
    "Psychology",
    "Economics",
    "Geography",
    "Literature",
    "Philosophy",
    "Statistics",
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-7xl mx-auto">
            {[
              { name: "Mathematics", icon: "🔢", count: "3" },
              { name: "Biology", icon: "🧬", count: "3" },
              { name: "Chemistry", icon: "⚗️", count: "3" },
              { name: "Physics", icon: "⚡", count: "3" },
              { name: "History", icon: "📚", count: "3" },
              { name: "English", icon: "📖", count: "3" },
              { name: "Computer Science", icon: "💻", count: "3" },
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
