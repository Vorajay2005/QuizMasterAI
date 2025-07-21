import { motion } from "framer-motion";
import { Trophy, Clock, Users, Code } from "lucide-react";

const HackathonBanner = () => {
  const stats = [
    { label: "Hours of Development", value: "48", icon: Clock },
    { label: "Lines of Code", value: "15,000+", icon: Code },
    { label: "Features Built", value: "25+", icon: Users },
    { label: "AI Integrations", value: "3", icon: Trophy },
  ];

  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 section-padding py-16">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span className="font-semibold">Panda Hacks 2025 Submission</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold font-display mb-4">
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                AI Exam
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent">
                Readiness Checker
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Transform your study notes into personalized AI quizzes. Built
              with ❤️ for students, by students.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white/10 backdrop-blur rounded-lg p-4"
              >
                <div className="text-3xl font-bold text-yellow-300 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Tech Stack Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/10 backdrop-blur rounded-xl p-6 max-w-4xl mx-auto"
          >
            <h3 className="text-xl font-semibold mb-4">
              Built With Cutting-Edge Tech
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "React 18",
                "Node.js",
                "OpenAI GPT-4",
                "MongoDB",
                "Tailwind CSS",
                "Framer Motion",
                "Express.js",
                "Zustand",
              ].map((tech, index) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.05 }}
                  className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/60 text-sm"
            >
              ↓ Scroll to explore the demo ↓
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-24 -translate-x-24"></div>
    </div>
  );
};

export default HackathonBanner;
