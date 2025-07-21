import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ConfettiCelebration = ({ trigger = false, duration = 3000 }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (trigger) {
      setShowConfetti(true);
      generateParticles();

      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  const generateParticles = () => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
    ];
    const newParticles = [];

    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        velocityX: (Math.random() - 0.5) * 6,
        velocityY: Math.random() * 3 + 2,
      });
    }
    setParticles(newParticles);
  };

  if (!showConfetti) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
              borderRadius: Math.random() > 0.5 ? "50%" : "0%",
            }}
            initial={{
              x: particle.x,
              y: particle.y,
              rotate: particle.rotation,
              opacity: 1,
            }}
            animate={{
              y: window.innerHeight + 20,
              x: particle.x + particle.velocityX * 100,
              rotate: particle.rotation + 720,
              opacity: 0,
            }}
            transition={{
              duration: duration / 1000,
              ease: "easeOut",
            }}
            exit={{ opacity: 0 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ConfettiCelebration;
