import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, TrendingUp, Zap, Star, Trophy } from "lucide-react";

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for notification events
    const handleNotification = (event) => {
      const notification = {
        id: Date.now(),
        ...event.detail,
        timestamp: new Date(),
      };
      setNotifications((prev) => [...prev, notification]);

      // Auto remove after 5 seconds
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    };

    window.addEventListener("showNotification", handleNotification);
    return () =>
      window.removeEventListener("showNotification", handleNotification);
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case "achievement":
        return <Award className="w-5 h-5" />;
      case "progress":
        return <TrendingUp className="w-5 h-5" />;
      case "streak":
        return <Zap className="w-5 h-5" />;
      case "score":
        return <Star className="w-5 h-5" />;
      case "milestone":
        return <Trophy className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case "achievement":
        return "from-yellow-400 to-orange-500";
      case "progress":
        return "from-green-400 to-emerald-500";
      case "streak":
        return "from-purple-400 to-pink-500";
      case "score":
        return "from-blue-400 to-indigo-500";
      case "milestone":
        return "from-red-400 to-pink-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`max-w-sm bg-white rounded-lg shadow-lg border-l-4 border-gradient-to-r ${getColors(
              notification.type
            )} overflow-hidden`}
          >
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${getColors(
                    notification.type
                  )} flex items-center justify-center text-white`}
                >
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                    </div>

                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {notification.emoji && (
                    <div className="mt-2 text-2xl">{notification.emoji}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar for auto-dismiss */}
            <motion.div
              className={`h-1 bg-gradient-to-r ${getColors(notification.type)}`}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Helper function to show notifications
export const showNotification = (notification) => {
  const event = new CustomEvent("showNotification", {
    detail: notification,
  });
  window.dispatchEvent(event);
};

export default NotificationManager;
