import { create } from "zustand";
import axios from "axios";
import { API_URL } from "../constants/config";

const useRegionStore = create((set) => ({
  regions: [],
  region: null,
  regionStats: null,
  isLoading: false,
  error: null,

  // Get all regions
  getRegions: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      // Construct query string from filters
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`${API_URL}/regions?${queryParams}`);

      if (response.data.success) {
        set({
          regions: response.data.data,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching regions",
        isLoading: false,
      });
    }
  },

  // Get single region
  getRegion: async (id) => {
    set({ isLoading: true, error: null, region: null });
    try {
      const response = await axios.get(`${API_URL}/regions/${id}`);

      if (response.data.success) {
        set({
          region: response.data.data,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error fetching region",
        isLoading: false,
      });
    }
  },

  // Create region (admin only)
  createRegion: async (regionData) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/regions`, regionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Add the new region to regions
        set((state) => ({
          regions: [...state.regions, response.data.data],
          isLoading: false,
        }));
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error creating region",
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || "Error creating region",
      };
    }
  },

  // Update region (admin only)
  updateRegion: async (id, updateData) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/regions/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Update the region in state
        set((state) => ({
          region: response.data.data,
          regions: state.regions.map((reg) =>
            reg._id === id ? response.data.data : reg
          ),
          isLoading: false,
        }));
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error updating region",
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || "Error updating region",
      };
    }
  },

  // Delete region (admin only)
  deleteRegion: async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "Authentication required" };

    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}/regions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Remove the region from state
        set((state) => ({
          regions: state.regions.filter((reg) => reg._id !== id),
          isLoading: false,
        }));
        return { success: true };
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error deleting region",
        isLoading: false,
      });
      return {
        success: false,
        error: error.response?.data?.message || "Error deleting region",
      };
    }
  },

  // Get region statistics (admin/officer only)
  getRegionStats: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/regions/stats/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        set({
          regionStats: response.data.data,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Error fetching region statistics",
        isLoading: false,
      });
    }
  },

  // Clear current region
  clearRegion: () => set({ region: null }),

  // Clear errors
  clearError: () => set({ error: null }),
}));

export default useRegionStore;
