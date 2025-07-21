import { motion } from "framer-motion";
import { Brain, Sparkles, Zap, BookOpen } from "lucide-react";
import TypewriterText from "./TypewriterText";

const AIGenerationAnimation = ({
  isGenerating = false,
  currentStep = 0,
  onComplete,
}) => {
  const steps = [
    {
      icon: BookOpen,
      title: "Analyzing your content...",
      description: "Reading through your notes and identifying key concepts",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "AI is thinking...",
      description: "Processing information and understanding topics",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Sparkles,
      title: "Crafting questions...",
      description: "Creating personalized quiz questions just for you",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Zap,
      title: "Finalizing your quiz...",
      description: "Adding the perfect difficulty level and explanations",
      color: "from-green-500 to-emerald-500",
    },
  ];

  if (!isGenerating) return null;

  const currentStepData = steps[currentStep] || steps[0];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center"
      >
        {/* Animated Icon */}
        <div className="relative mb-8">
          <motion.div
            className={`w-20 h-20 rounded-full bg-gradient-to-r ${currentStepData.color} flex items-center justify-center mx-auto shadow-lg`}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <IconComponent className="w-8 h-8 text-white" />
          </motion.div>

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                x: Math.cos((i * Math.PI) / 4) * 40,
                y: Math.sin((i * Math.PI) / 4) * 40,
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Step Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          <TypewriterText
            text={currentStepData.title}
            speed={100}
            showCursor={false}
          />
        </h3>

        {/* Step Description */}
        <p className="text-gray-600 mb-8 text-lg">
          <TypewriterText
            text={currentStepData.description}
            speed={50}
            delay={1000}
            showCursor={false}
          />
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <motion.div
            className={`h-2 rounded-full bg-gradient-to-r ${currentStepData.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-2 mb-6">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index <= currentStep ? "bg-primary-500" : "bg-gray-300"
              }`}
              animate={
                index === currentStep
                  ? {
                      scale: [1, 1.2, 1],
                    }
                  : {}
              }
              transition={{
                duration: 1,
                repeat: index === currentStep ? Infinity : 0,
              }}
            />
          ))}
        </div>

        {/* Fun Fact */}
        <div className="text-sm text-gray-500 italic">
          💡 Did you know? Our AI can generate a complete quiz in under 30
          seconds!
        </div>

        {/* Pulse Animation Background */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-primary-200 opacity-50"
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
};

export default AIGenerationAnimation;
