import { create } from "zustand";
import axios from "axios";
import { API_URL } from "../constants/config";

const useDepartmentStore = create((set) => ({
  departments: [],
  department: null,
  departmentStats: null,
  isLoading: false,
  error: null,

  // Get all departments
  getDepartments: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      // Construct query string from filters
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`${API_URL}/departments?${queryParams}`);

      if (response.data.success) {
        set({
          departments: response.data.data,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching departments",
        isLoading: false,
      });
    }
  },

  // Get single department
  getDepartment: async (id) => {
    set({ isLoading: true, error: null, department: null });
    try {
      const response = await axios.get(`${API_URL}/departments/${id}`);

      if (response.data.success) {
        set({
          department: response.data.data,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching department",
        isLoading: false,
      });
    }
  },

  // Create department (admin only)
  createDepartment: async (departmentData) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}/departments`,
        departmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Add the new department to departments
        set((state) => ({
          departments: [...state.departments, response.data.data],
          isLoading: false,
        }));
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error creating department",
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || "Error creating department",
      };
    }
  },

  // Update department (admin only)
  updateDepartment: async (id, updateData) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}/departments/${id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update the department in state
        set((state) => ({
          department: response.data.data,
          departments: state.departments.map((dept) =>
            dept._id === id ? response.data.data : dept
          ),
          isLoading: false,
        }));
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error updating department",
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || "Error updating department",
      };
    }
  },

  // Delete department (admin only)
  deleteDepartment: async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}/departments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Remove the department from state
        set((state) => ({
          departments: state.departments.filter((dept) => dept._id !== id),
          isLoading: false,
        }));
        return { success: true };
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error deleting department",
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || "Error deleting department",
      };
    }
  },

  // Get department statistics (admin/officer only)
  getDepartmentStats: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/departments/stats/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        set({
          departmentStats: response.data.data,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          "Error fetching department statistics",
        isLoading: false,
      });
    }
  },

  // Clear current department
  clearDepartment: () => set({ department: null }),

  // Clear errors
  clearError: () => set({ error: null }),
}));

export default useDepartmentStore;
