import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const useReportStore = create((set, get) => ({
  reports: [],
  report: null,
  nearbyReports: [],
  userReports: [],
  officerReports: [],
  reportStats: null,
  isLoading: false,
  error: null,
  pagination: null,

  // Get all reports
  getReports: async (page = 1, limit = 10, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      // Construct query string from filters
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters,
      }).toString();

      const response = await axios.get(`${API_URL}/reports?${queryParams}`);

      if (response.data.success) {
        set({
          reports: response.data.data,
          pagination: response.data.pagination,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching reports",
        isLoading: false,
      });
    }
  },

  // Get reports by location (for map view)
  getNearbyReports: async (lat, lng, radius = 5) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_URL}/reports?lat=${lat}&lng=${lng}&radius=${radius}`
      );

      if (response.data.success) {
        set({
          nearbyReports: response.data.data,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching nearby reports",
        isLoading: false,
      });
    }
  },

  // Get single report
  getReport: async (id) => {
    set({ isLoading: true, error: null, report: null });
    try {
      const response = await axios.get(`${API_URL}/reports/${id}`);

      if (response.data.success) {
        set({
          report: response.data.data,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching report",
        isLoading: false,
      });
    }
  },

  // Get reports for citizen (my reports)
  getUserReports: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/reports?citizen=me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        set({
          userReports: response.data.data,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching user reports",
        isLoading: false,
      });
    }
  },

  // Get reports for officer (assigned reports)
  getOfficerReports: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_URL}/reports?assignedOfficer=me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        set({
          officerReports: response.data.data,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Error fetching officer reports",
        isLoading: false,
      });
    }
  },

  // Create new report
  createReport: async (reportData) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/reports`, reportData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Add the new report to userReports
        set((state) => ({
          userReports: [response.data.data, ...state.userReports],
          isLoading: false,
        }));
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error creating report",
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || "Error creating report",
      };
    }
  },

  // Update report
  updateReport: async (id, updateData) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/reports/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Update the report in state
        set((state) => ({
          report: response.data.data,
          reports: state.reports.map((report) =>
            report._id === id ? response.data.data : report
          ),
          userReports: state.userReports.map((report) =>
            report._id === id ? response.data.data : report
          ),
          officerReports: state.officerReports.map((report) =>
            report._id === id ? response.data.data : report
          ),
          isLoading: false,
        }));
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error updating report",
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || "Error updating report",
      };
    }
  },

  // Add update to report
  addReportUpdate: async (id, updateData) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}/reports/${id}/updates`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update the report in state
        set((state) => ({
          report: response.data.data,
          reports: state.reports.map((report) =>
            report._id === id ? response.data.data : report
          ),
          userReports: state.userReports.map((report) =>
            report._id === id ? response.data.data : report
          ),
          officerReports: state.officerReports.map((report) =>
            report._id === id ? response.data.data : report
          ),
          isLoading: false,
        }));
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error adding update to report",
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || "Error adding update to report",
      };
    }
  },

  // Add feedback to report
  addReportFeedback: async (id, feedbackData) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}/reports/${id}/feedback`,
        feedbackData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update the report in state
        set((state) => ({
          report: response.data.data,
          reports: state.reports.map((report) =>
            report._id === id ? response.data.data : report
          ),
          userReports: state.userReports.map((report) =>
            report._id === id ? response.data.data : report
          ),
          isLoading: false,
        }));
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Error adding feedback to report",
        isLoading: false,
      });
      return {
        success: false,
        error:
          error.response?.data?.message || "Error adding feedback to report",
      };
    }
  },

  // Upload report photo
  uploadReportPhoto: async (id, formData) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}/reports/${id}/photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        // Update the report in state
        set((state) => ({
          report: response.data.data,
          reports: state.reports.map((report) =>
            report._id === id ? response.data.data : report
          ),
          userReports: state.userReports.map((report) =>
            report._id === id ? response.data.data : report
          ),
          officerReports: state.officerReports.map((report) =>
            report._id === id ? response.data.data : report
          ),
          isLoading: false,
        }));
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Error uploading photo to report",
        isLoading: false,
      });
      return {
        success: false,
        error:
          error.response?.data?.message || "Error uploading photo to report",
      };
    }
  },

  // Get report analytics (admin)
  getReportAnalytics: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/reports/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        set({
          reportStats: response.data.data,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Error fetching report analytics",
        isLoading: false,
      });
    }
  },

  // Delete report
  deleteReport: async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}/reports/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Remove the report from state
        set((state) => ({
          reports: state.reports.filter((report) => report._id !== id),
          userReports: state.userReports.filter((report) => report._id !== id),
          officerReports: state.officerReports.filter(
            (report) => report._id !== id
          ),
          isLoading: false,
        }));
        return { success: true };
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error deleting report",
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || "Error deleting report",
      };
    }
  },

  // Clear current report
  clearReport: () => set({ report: null }),

  // Clear errors
  clearError: () => set({ error: null }),
}));

export default useReportStore;
