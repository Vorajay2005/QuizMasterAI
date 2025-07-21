import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../utils/axios";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Register action
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/auth/register", userData);
          const { token, user } = response.data;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Set token for future requests
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;

          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage =
            error.response?.data?.error || "Registration failed";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post("/auth/login", credentials);
          const { token, user } = response.data;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Set token for future requests
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;

          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage = error.response?.data?.error || "Login failed";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Logout action
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Remove token from axios defaults
        delete axiosInstance.defaults.headers.common["Authorization"];
      },

      // Get current user
      getCurrentUser: async () => {
        const { token } = get();
        if (!token) return { success: false, error: "No token" };

        set({ isLoading: true });
        try {
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;
          const response = await axiosInstance.get("/auth/me");

          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true, data: response.data };
        } catch (error) {
          get().logout(); // Clear invalid token
          return { success: false, error: error.response?.data?.error };
        }
      },

      // Update profile
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.put(
            "/auth/profile",
            profileData
          );

          set({
            user: response.data.user,
            isLoading: false,
          });

          return { success: true, data: response.data };
        } catch (error) {
          const errorMessage =
            error.response?.data?.error || "Profile update failed";
          set({
            error: errorMessage,
            isLoading: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Initialize auth (check for existing token)
      initializeAuth: () => {
        const { token } = get();
        if (token) {
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;
          get().getCurrentUser();
        }
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
