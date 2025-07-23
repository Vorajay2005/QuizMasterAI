import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Sparkles, Zap } from "lucide-react";
import DemoQuizCard from "./DemoQuizCard";
import { demoQuizzes } from "../../data/demoData";
import useAuthStore from "../../store/authStore";

const DemoSection = () => {
  const { isAuthenticated } = useAuthStore();
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  const handleTryAnotherDemo = () => {
    // Cycle through all available demo quizzes
    setCurrentQuizIndex((prevIndex) => (prevIndex + 1) % demoQuizzes.length);
  };
  return (
    <section className="section-padding bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="text-yellow-300" size={32} />
            <h2 className="text-4xl font-bold font-display">
              See It In Action
            </h2>
            <Zap className="text-yellow-300" size={32} />
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Experience the power of AI-driven learning with our interactive demo
            quiz. No signup required!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Quiz Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <DemoQuizCard quiz={demoQuizzes[currentQuizIndex]} />
          </motion.div>

          {/* Features Highlight */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col justify-center"
          >
            <div className="card bg-white/10 backdrop-blur border-white/20">
              <h3 className="text-2xl font-semibold mb-6">
                What makes this special?
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-gray-900">AI</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">
                      Smart Question Generation
                    </h4>
                    <p className="text-white/80 text-sm">
                      Our AI analyzes your content and creates relevant
                      questions that test your understanding.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-gray-900">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Instant Feedback</h4>
                    <p className="text-white/80 text-sm">
                      Get immediate explanations and understand your mistakes
                      right away.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-gray-900">📊</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Adaptive Learning</h4>
                    <p className="text-white/80 text-sm">
                      Questions adjust to your performance level for optimal
                      challenge.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-gray-900">🎯</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Personalized Insights</h4>
                    <p className="text-white/80 text-sm">
                      Identify weak areas and get specific recommendations to
                      improve.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">Live Demo Available</span>
                </div>
                <p className="text-sm text-white/80">
                  Try the quiz above to experience how AI transforms your study
                  material into interactive learning!
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="card bg-white/10 backdrop-blur border-white/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">
              Ready to Transform Your Study Routine?
            </h3>
            <p className="text-white/90 mb-6">
              Join thousands of students who are already studying smarter with
              AI-powered quizzes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold cursor-pointer"
                  >
                    Go to Dashboard
                  </motion.div>
                </Link>
              ) : (
                <Link to="/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold cursor-pointer"
                  >
                    Create Free Account
                  </motion.div>
                </Link>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold cursor-pointer hover:bg-white hover:text-primary-600 transition-colors"
                onClick={handleTryAnotherDemo}
              >
                Try Another Demo ({currentQuizIndex + 1}/{demoQuizzes.length})
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;
