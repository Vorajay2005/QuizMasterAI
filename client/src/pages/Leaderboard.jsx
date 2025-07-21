import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import { getInitials, generateAvatarColor } from "../utils/helpers";
import Button from "../components/common/Button";

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState("week");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Listen for quiz completions to refresh leaderboard
  useEffect(() => {
    const handleQuizCompleted = () => {
      console.log("Quiz completed, updating leaderboard timestamp...");
      setLastUpdated(new Date());
      toast.success("Leaderboard updated!");
    };

    window.addEventListener("quiz-completed", handleQuizCompleted);

    return () => {
      window.removeEventListener("quiz-completed", handleQuizCompleted);
    };
  }, []);

  const refreshLeaderboard = () => {
    setLastUpdated(new Date());
    toast.success("Leaderboard refreshed!");
  };

  // Mock leaderboard data
  const leaderboardData = [
    {
      rank: 1,
      name: "Sarah Johnson",
      grade: "11th",
      school: "Lincoln High School",
      avgScore: 94,
      totalQuizzes: 45,
      studyStreak: 15,
    },
    {
      rank: 2,
      name: "Alex Chen",
      grade: "12th",
      school: "Roosevelt Academy",
      avgScore: 92,
      totalQuizzes: 52,
      studyStreak: 12,
    },
    {
      rank: 3,
      name: "Emma Wilson",
      grade: "10th",
      school: "Washington High",
      avgScore: 90,
      totalQuizzes: 38,
      studyStreak: 8,
    },
    {
      rank: 4,
      name: "Marcus Brown",
      grade: "11th",
      school: "Jefferson High",
      avgScore: 89,
      totalQuizzes: 41,
      studyStreak: 10,
    },
    {
      rank: 5,
      name: "Lily Wang",
      grade: "12th",
      school: "Madison Academy",
      avgScore: 88,
      totalQuizzes: 49,
      studyStreak: 6,
    },
    {
      rank: 6,
      name: "David Martinez",
      grade: "9th",
      school: "Franklin High",
      avgScore: 87,
      totalQuizzes: 33,
      studyStreak: 9,
    },
    {
      rank: 7,
      name: "You",
      grade: "11th",
      school: "Your School",
      avgScore: 85,
      totalQuizzes: 28,
      studyStreak: 7,
      isCurrentUser: true,
    },
  ];

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-500";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400";
      case 3:
        return "bg-gradient-to-r from-amber-500 to-amber-600";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="section-padding">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900 font-display">
              Leaderboard
            </h1>
            <Button
              onClick={refreshLeaderboard}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
          <p className="text-gray-600">
            See how you stack up against other students
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </motion.div>

        {/* Timeframe Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="card p-2 flex space-x-2">
            {["week", "month", "all"].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeframe === period
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                This{" "}
                {period === "all"
                  ? "All Time"
                  : period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="grid grid-cols-3 gap-4 items-end">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="card p-6 mb-4">
                <div
                  className={`w-20 h-20 rounded-full ${generateAvatarColor(
                    leaderboardData[1].name
                  )} flex items-center justify-center text-white text-xl font-bold mx-auto mb-4`}
                >
                  {getInitials(leaderboardData[1].name)}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {leaderboardData[1].name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {leaderboardData[1].grade}
                </p>
                <div className="text-2xl font-bold text-primary-600">
                  {leaderboardData[1].avgScore}%
                </div>
              </div>
              <div className="h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-t-lg flex items-center justify-center text-white font-bold text-xl">
                #2
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="card p-6 mb-4 ring-2 ring-yellow-400">
                <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div
                  className={`w-24 h-24 rounded-full ${generateAvatarColor(
                    leaderboardData[0].name
                  )} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4`}
                >
                  {getInitials(leaderboardData[0].name)}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {leaderboardData[0].name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {leaderboardData[0].grade}
                </p>
                <div className="text-3xl font-bold text-yellow-600">
                  {leaderboardData[0].avgScore}%
                </div>
              </div>
              <div className="h-32 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-t-lg flex items-center justify-center text-white font-bold text-2xl">
                #1
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <div className="card p-6 mb-4">
                <div
                  className={`w-20 h-20 rounded-full ${generateAvatarColor(
                    leaderboardData[2].name
                  )} flex items-center justify-center text-white text-xl font-bold mx-auto mb-4`}
                >
                  {getInitials(leaderboardData[2].name)}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {leaderboardData[2].name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {leaderboardData[2].grade}
                </p>
                <div className="text-2xl font-bold text-primary-600">
                  {leaderboardData[2].avgScore}%
                </div>
              </div>
              <div className="h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-lg flex items-center justify-center text-white font-bold text-xl">
                #3
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                Full Rankings
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {leaderboardData.map((user, index) => (
                <motion.div
                  key={user.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    user.isCurrentUser
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 flex justify-center">
                      {getRankIcon(user.rank)}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`w-12 h-12 rounded-full ${generateAvatarColor(
                        user.name
                      )} flex items-center justify-center text-white font-medium`}
                    >
                      {getInitials(user.name)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                          {user.isCurrentUser && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {user.grade} • {user.school}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">
                          {user.avgScore}%
                        </div>
                        <div className="text-gray-600 text-xs">Avg Score</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">
                          {user.totalQuizzes}
                        </div>
                        <div className="text-gray-600 text-xs">Quizzes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-orange-600 flex items-center">
                          🔥 {user.studyStreak}
                        </div>
                        <div className="text-gray-600 text-xs">Streak</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Achievement Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <div className="card text-center">
            <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Most Improved
            </h3>
            <p className="text-gray-600 mb-2">Alex Chen</p>
            <p className="text-sm text-green-600">+25% this week</p>
          </div>

          <div className="card text-center">
            <Trophy className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Quiz Champion
            </h3>
            <p className="text-gray-600 mb-2">Sarah Johnson</p>
            <p className="text-sm text-yellow-600">52 quizzes completed</p>
          </div>

          <div className="card text-center">
            <Award className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Study Streak King
            </h3>
            <p className="text-gray-600 mb-2">Marcus Brown</p>
            <p className="text-sm text-purple-600">15 days strong</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
