import { create } from "zustand";
import { endpoints } from "../utils/apiClient";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Register user
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await endpoints.auth.register(userData);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        set({
          user: response.data.data,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error during registration",
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || "Error during registration",
      };
    }
  },

  // Login user
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await endpoints.auth.login({ email, password });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        set({
          user: response.data.data,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Invalid credentials",
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || "Invalid credentials",
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await endpoints.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("token");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // Load user (check authentication status)
  loadUser: async () => {
    const token = localStorage.getItem("token");
    console.log("LoadUser - Token exists:", !!token);

    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    set({ isLoading: true });
    try {
      console.log("LoadUser - Fetching user data...");
      const response = await endpoints.auth.me();

      if (response.data.success) {
        console.log("LoadUser - User data retrieved:", response.data.data);
        set({
          user: response.data.data,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("LoadUser - Error:", error);
      localStorage.removeItem("token");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.response?.data?.message || "Authentication failed",
      });
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await endpoints.users.update(userData._id, userData);

      if (response.data.success) {
        set({
          user: response.data.data,
          isLoading: false,
        });
        return { success: true };
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error updating profile",
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || "Error updating profile",
      };
    }
  },

  // Clear errors
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
