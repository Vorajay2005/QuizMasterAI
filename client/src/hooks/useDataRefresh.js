import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/**
 * Custom hook to handle data refresh notifications and states
 * Used across Dashboard, Browse, Analytics, and Leaderboard pages
 */
export const useDataRefresh = (refreshFunction, pageName = "Data") => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const handleQuizCompleted = async () => {
      console.log(`Quiz completed, refreshing ${pageName}...`);
      setIsRefreshing(true);

      try {
        await refreshFunction();
        setLastRefresh(new Date());

        // Show success notification
        toast.success(`${pageName} updated!`, {
          duration: 2000,
          icon: "🔄",
        });
      } catch (error) {
        console.error(`Failed to refresh ${pageName}:`, error);
        toast.error(`Failed to refresh ${pageName}`);
      } finally {
        setIsRefreshing(false);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "quiz-completed") {
        handleQuizCompleted();
        localStorage.removeItem("quiz-completed");
      }
    };

    // Listen for quiz completion events
    window.addEventListener("quiz-completed", handleQuizCompleted);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("quiz-completed", handleQuizCompleted);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshFunction, pageName]);

  const manualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFunction();
      setLastRefresh(new Date());
      toast.success(`${pageName} refreshed!`);
    } catch (error) {
      toast.error(`Failed to refresh ${pageName}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing,
    lastRefresh,
    manualRefresh,
  };
};

export default useDataRefresh;
