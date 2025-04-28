import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface UrlData {
  _id: string;
  shortId: string;
  redirectUrl: string;
  createdAt: string;
  visitHistory: Array<{
    timestamp: string;
    userId?: string;
    username?: string;
  }>;
  qrCodePath?: string | null;
}

// Access a short URL - with auth check
export const accessShortUrl = async (shortId: string) => {
  try {
    const response = await api.get(`/${shortId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    // Check if error is due to authentication requirement
    if (error.response && error.response.status === 401) {
      // Store the intended URL for redirection after login
      localStorage.setItem("redirectAfterLogin", `/${shortId}`);
      return { success: false, needsAuth: true };
    }

    return {
      success: false,
      error: error.response?.data?.error || "Failed to access URL",
    };
  }
};

// Create a new short URL
export const createShortUrl = async (originalUrl: string) => {
  try {
    const response = await api.post("/url", { url: originalUrl });
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to create short URL",
    };
  }
};

// Get URLs for the logged-in user
export const getUserUrls = async () => {
  try {
    const response = await api.get("/url/user-urls");
    return { success: true, urls: response.data.urls };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch URLs",
    };
  }
};

// Get analytics for a specific URL
export const getUrlAnalytics = async (shortId: string) => {
  try {
    const response = await api.get(`/url/analytics/${shortId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch analytics",
    };
  }
};

// Delete a URL
export const deleteUrl = async (shortId: string) => {
  try {
    const response = await api.delete(`/url/remove/${shortId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to delete URL",
    };
  }
};

export default {
  accessShortUrl,
  createShortUrl,
  getUserUrls,
  getUrlAnalytics,
  deleteUrl,
};
