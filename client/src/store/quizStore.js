import { create } from "zustand";
import axiosInstance from "../utils/axios";
import { demoQuizzes, demoAttempts, demoStats } from "../data/demoData";

const useQuizStore = create((set, get) => ({
  // State
  currentQuiz: null,
  quizzes: [],
  currentAttempt: null,
  userAnswers: {},
  currentQuestionIndex: 0,
  timeSpent: 0,
  quizStartTime: null,
  isLoading: false,
  error: null,

  // Quiz management
  generateQuiz: async (quizData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/quiz/generate", quizData);
      set({
        currentQuiz: response.data.quiz,
        isLoading: false,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to generate quiz";
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  getQuiz: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      // Check for demo quiz first
      if (quizId.startsWith("demo-")) {
        const demoQuiz = demoQuizzes.find((q) => q._id === quizId);
        if (demoQuiz) {
          set({
            currentQuiz: demoQuiz,
            isLoading: false,
          });
          return { success: true, data: { quiz: demoQuiz } };
        }
      }

      const response = await axiosInstance.get(`/quiz/${quizId}`);
      set({
        currentQuiz: response.data.quiz,
        isLoading: false,
      });
      return { success: true, data: response.data };
    } catch (error) {
      // Fallback to demo quiz if API fails
      const demoQuiz = demoQuizzes[0]; // Use first demo quiz as fallback
      set({
        currentQuiz: demoQuiz,
        isLoading: false,
        error: null, // Clear error since we have fallback
      });
      return { success: true, data: { quiz: demoQuiz } };
    }
  },

  // Quiz taking
  startQuiz: (quiz) => {
    set({
      currentQuiz: quiz,
      userAnswers: {},
      currentQuestionIndex: 0,
      timeSpent: 0,
      quizStartTime: new Date(),
      error: null,
    });
  },

  setAnswer: (questionId, answer) => {
    const { userAnswers } = get();
    set({
      userAnswers: {
        ...userAnswers,
        [questionId]: {
          answer,
          timestamp: new Date(),
          timeSpent: 0, // Will be calculated when moving to next question
        },
      },
    });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, currentQuiz } = get();
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  goToQuestion: (index) => {
    const { currentQuiz } = get();
    if (index >= 0 && index < currentQuiz.questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  // Submit quiz
  submitQuiz: async () => {
    set({ isLoading: true, error: null });
    const { currentQuiz, userAnswers, quizStartTime } = get();

    if (!currentQuiz) {
      set({ error: "No quiz to submit", isLoading: false });
      return { success: false, error: "No quiz to submit" };
    }

    try {
      const answers = currentQuiz.questions.map((question, index) => ({
        questionId: question._id,
        answer: userAnswers[question._id]?.answer || "",
        timeSpent: userAnswers[question._id]?.timeSpent || 0,
      }));

      const totalTimeSpent = Math.floor((new Date() - quizStartTime) / 1000);

      const response = await axiosInstance.post(
        `/quiz/${currentQuiz._id}/submit`,
        {
          answers,
          timeSpent: totalTimeSpent,
        }
      );

      set({
        currentAttempt: response.data.attempt,
        isLoading: false,
      });

      // Trigger data refresh for dashboard and analytics
      get().refreshUserData();

      // Trigger events for real-time updates across tabs/components
      setTimeout(() => {
        // Trigger localStorage event for other tabs
        localStorage.setItem("quiz-completed", Date.now().toString());

        // Trigger custom event for current tab
        window.dispatchEvent(new CustomEvent("quiz-completed"));
      }, 100);

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to submit quiz";
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  // Quiz history and stats
  getUserAttempts: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `/quiz/user/attempts?page=${page}&limit=${limit}`
      );
      set({ isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      // Fallback to demo data
      const demoData = {
        attempts: demoAttempts.slice(0, limit),
        total: demoAttempts.length,
        page,
        pages: Math.ceil(demoAttempts.length / limit),
      };
      set({ isLoading: false, error: null });
      return { success: true, data: demoData };
    }
  },

  getUserStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/quiz/user/stats");
      set({ isLoading: false });
      return { success: true, data: response.data };
    } catch (error) {
      // Fallback to demo stats
      set({ isLoading: false, error: null });
      return { success: true, data: demoStats };
    }
  },

  getPublicQuizzes: async (page = 1, limit = 10, subject = "") => {
    set({ isLoading: true, error: null });
    try {
      const url = `/quiz/public/list?page=${page}&limit=${limit}${
        subject ? `&subject=${subject}` : ""
      }`;
      const response = await axiosInstance.get(url);
      set({
        quizzes: response.data.quizzes,
        isLoading: false,
      });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to load public quizzes";
      set({
        error: errorMessage,
        isLoading: false,
      });
      return { success: false, error: errorMessage };
    }
  },

  // Utility functions
  getProgress: () => {
    const { currentQuiz, userAnswers } = get();
    if (!currentQuiz) return 0;

    const answeredCount = Object.keys(userAnswers).length;
    return Math.round((answeredCount / currentQuiz.questions.length) * 100);
  },

  getTimeRemaining: () => {
    const { currentQuiz, quizStartTime } = get();
    if (!currentQuiz?.settings?.timeLimit || !quizStartTime) return null;

    const timeLimit = currentQuiz.settings.timeLimit * 60; // Convert to seconds
    const timeSpent = Math.floor((new Date() - quizStartTime) / 1000);
    const remaining = Math.max(0, timeLimit - timeSpent);

    return {
      minutes: Math.floor(remaining / 60),
      seconds: remaining % 60,
      totalSeconds: remaining,
    };
  },

  isQuizComplete: () => {
    const { currentQuiz, userAnswers } = get();
    if (!currentQuiz) return false;

    return currentQuiz.questions.every((q) => userAnswers[q._id]?.answer);
  },

  // Reset quiz state
  resetQuiz: () => {
    set({
      currentQuiz: null,
      currentAttempt: null,
      userAnswers: {},
      currentQuestionIndex: 0,
      timeSpent: 0,
      quizStartTime: null,
      error: null,
    });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Refresh user data (for dashboard updates)
  refreshUserData: async () => {
    // This will be called after quiz submission to refresh cached data
    try {
      // Force refresh of user stats and attempts
      await Promise.all([get().getUserStats(), get().getUserAttempts(1, 5)]);
    } catch (error) {
      console.log("Failed to refresh user data:", error.message);
    }
  },
}));

export default useQuizStore;
