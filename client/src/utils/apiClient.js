import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API endpoints
const endpoints = {
  auth: {
    login: (data) => apiClient.post("/auth/login", data),
    register: (data) => apiClient.post("/auth/register", data),
    logout: () => apiClient.get("/auth/logout"),
    me: () => apiClient.get("/auth/me"),
    changePassword: (data) => apiClient.post("/auth/change-password", data),
    checkRole: () => apiClient.get("/auth/checkrole"),
  },
  reports: {
    getAll: (params) => apiClient.get("/reports", { params }),
    get: (id) => apiClient.get(`/reports/${id}`),
    getById: (id) => apiClient.get(`/reports/${id}`),
    create: (data) =>
      apiClient.post("/reports", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    update: (id, data) => apiClient.put(`/reports/${id}`, data),
    delete: (id) => apiClient.delete(`/reports/${id}`),
    getByUser: () => apiClient.get("/reports/user"),
    getAssigned: () => apiClient.get("/reports/assigned"),
    updateStatus: (id, status) =>
      apiClient.patch(`/reports/${id}/status`, { status }),
    addComment: (id, data) => apiClient.post(`/reports/${id}/comments`, data),
    upload: (formData) =>
      apiClient.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    getTimeline: (id) => apiClient.get(`/reports/${id}/timeline`),
    cancel: (id) => apiClient.patch(`/reports/${id}/cancel`),
    acknowledge: (id) => apiClient.patch(`/reports/${id}/acknowledge`),
    close: (id) => apiClient.patch(`/reports/${id}/close`),
    getDashboardStats: () => apiClient.get("/reports/dashboard-stats"),
  },
  users: {
    getAll: (params) => apiClient.get("/users", { params }),
    get: (id) => apiClient.get(`/users/${id}`),
    create: (data) => apiClient.post("/users", data),
    update: (id, data) => apiClient.put(`/users/${id}`, data),
    delete: (id) => apiClient.delete(`/users/${id}`),
    updateRole: (id, role) => apiClient.patch(`/users/${id}/role`, { role }),
    getOfficers: () => apiClient.get("/users/officers"),
  },
  departments: {
    getAll: () => apiClient.get("/departments"),
    get: (id) => apiClient.get(`/departments/${id}`),
    create: (data) => apiClient.post("/departments", data),
    update: (id, data) => apiClient.put(`/departments/${id}`, data),
    delete: (id) => apiClient.delete(`/departments/${id}`),
  },
  regions: {
    getAll: () => apiClient.get("/regions"),
    get: (id) => apiClient.get(`/regions/${id}`),
    create: (data) => apiClient.post("/regions", data),
    update: (id, data) => apiClient.put(`/regions/${id}`, data),
    delete: (id) => apiClient.delete(`/regions/${id}`),
  },
  categories: {
    getAll: () => apiClient.get("/categories"),
    get: (id) => apiClient.get(`/categories/${id}`),
    create: (data) => apiClient.post("/categories", data),
    update: (id, data) => apiClient.put(`/categories/${id}`, data),
    delete: (id) => apiClient.delete(`/categories/${id}`),
  },
};

export { apiClient, endpoints };
export default apiClient;
