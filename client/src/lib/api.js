import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// REST API base (always under /api)
export const api = axios.create({
  baseURL: `${apiBase}/api`,
  withCredentials: false,
});

// Public files (uploads) base URL
export const filesBaseUrl = apiBase;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tb_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    // Normalize API error format to something usable
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      "Request failed";
    error.normalizedMessage = message;
    return Promise.reject(error);
  }
);

