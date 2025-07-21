import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Target, Trophy, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

import useQuizStore from "../store/quizStore";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { getScoreColor } from "../utils/helpers";

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { getUserStats } = useQuizStore();

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const result = await getUserStats();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();

    // Auto-refresh analytics every 30 seconds to catch updates
    const refreshInterval = setInterval(loadStats, 30000);

    // Listen for quiz completion events
    const handleQuizCompleted = () => {
      console.log("Quiz completed, refreshing analytics...");
      loadStats();
    };

    window.addEventListener("quiz-completed", handleQuizCompleted);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener("quiz-completed", handleQuizCompleted);
    };
  }, [getUserStats]);

  // Mock data for demo
  const performanceData = [
    { date: "Jan 1", score: 65 },
    { date: "Jan 2", score: 70 },
    { date: "Jan 3", score: 75 },
    { date: "Jan 4", score: 82 },
    { date: "Jan 5", score: 78 },
    { date: "Jan 6", score: 85 },
    { date: "Jan 7", score: 88 },
  ];

  const subjectData = [
    { name: "Math", value: 85, color: "#0ea5e9" },
    { name: "Science", value: 78, color: "#10b981" },
    { name: "History", value: 92, color: "#f59e0b" },
    { name: "English", value: 76, color: "#ef4444" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

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
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-display mb-2">
            Your Analytics
          </h1>
          <p className="text-gray-600">
            Track your progress and identify areas for improvement
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trophy size={24} className="text-primary-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats?.totalQuizzes || 12}
            </div>
            <div className="text-gray-600">Total Quizzes</div>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target size={24} className="text-success-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats?.averageScore || 84}%
            </div>
            <div className="text-gray-600">Average Score</div>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={24} className="text-warning-600" />
            </div>
            <div className="text-3xl font-bold text-success-600 mb-1">+15%</div>
            <div className="text-gray-600">Improvement</div>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-secondary-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">7</div>
            <div className="text-gray-600">Study Streak</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Performance Trend
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ fill: "#0ea5e9", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Subject Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Subject Performance
            </h3>
            <div className="space-y-4">
              {subjectData.map((subject) => (
                <div
                  key={subject.name}
                  className="flex items-center justify-between"
                >
                  <span className="font-medium text-gray-700">
                    {subject.name}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${subject.value}%`,
                          backgroundColor: subject.color,
                        }}
                      />
                    </div>
                    <span
                      className={`font-semibold ${getScoreColor(
                        subject.value
                      )}`}
                    >
                      {subject.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weak Areas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Areas to Focus
            </h3>
            <div className="space-y-3">
              {["Algebra", "Chemical Bonding", "World War II"].map(
                (topic, index) => (
                  <div
                    key={topic}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-900">{topic}</span>
                    <span className="badge badge-warning">Needs Review</span>
                  </div>
                )
              )}
            </div>
          </motion.div>

          {/* Study Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Study Insights
            </h3>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">
                  You're most productive in the evening
                </span>
              </div>
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">
                  Math quizzes show consistent improvement
                </span>
              </div>
              <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-gray-700">
                  7-day study streak - keep it up!
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
