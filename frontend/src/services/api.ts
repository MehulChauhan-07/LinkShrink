import axios from "axios";

const API_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Important for cookies
});

// Add request interceptor to add the token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API Error:", error);

    if (error.response?.status === 401) {
      // Store the current path for redirection after login if it's a URL access
      if (error.config.url.match(/\/[a-zA-Z0-9]{6,10}$/)) {
        localStorage.setItem("redirectAfterLogin", error.config.url);
      }

      // Don't redirect automatically if you're trying to access a protected URL
      if (!error.config.url.match(/\/[a-zA-Z0-9]{6,10}$/)) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    username: string;
    email: string;
    role: string;
  };
}

export interface SignupResponse {
  success: boolean;
  token: string;
  user: {
    username: string;
    email: string;
    role: string;
  };
}

export interface UrlResponse {
  shortId: string;
  redirectUrl: string;
  visitHistory: Array<{
    timestamp: string;
    userId?: string;
    username?: string;
  }>;
  createdAt: string;
  createdBy: {
    username: string;
    email: string;
    name: string;
  };
  requiresAuth?: boolean;
}

export const authApi = {
  login: async (usernameOrEmail: string, password: string) => {
    const response = await api.post<LoginResponse>("/user/login", {
      usernameOrEmail,
      password,
    });
    return response.data;
  },

  signup: async (
    username: string,
    name: string,
    email: string,
    password: string
  ) => {
    const response = await api.post<SignupResponse>("/user/signup", {
      username,
      name,
      email,
      password,
    });
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get<LoginResponse>("/user/verify");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },
};

export const urlApi = {
  createShortUrl: async (url: string) => {
    try {
      console.log("Creating short URL for:", url);
      const response = await api.post("/url", { url });
      console.log("Short URL created:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating URL:", error);
      throw error;
    }
  },

  getUrls: async () => {
    try {
      console.log("Fetching URLs...");
      // Try both potential endpoints
      try {
        const response = await api.get<UrlResponse[]>("/url");
        console.log("URLs fetched from /url:", response.data);
        return response.data;
      } catch (error) {
        console.log("Failed to fetch from /url, trying /url/user-urls");
        const response = await api.get<{ urls: UrlResponse[] }>(
          "/url/user-urls"
        );
        console.log("URLs fetched from /url/user-urls:", response.data);
        return response.data.urls;
      }
    } catch (error) {
      console.error("Failed to fetch URLs:", error);
      throw error;
    }
  },

  deleteUrl: async (shortId: string) => {
    try {
      // Try both potential endpoints
      try {
        const response = await api.delete(`/url/${shortId}`);
        return response.data;
      } catch (error) {
        const response = await api.delete(`/url/remove/${shortId}`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error deleting URL ${shortId}:`, error);
      throw error;
    }
  },

  getAnalytics: async (shortId: string) => {
    try {
      const response = await api.get(`/url/analytics/${shortId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching analytics for ${shortId}:`, error);
      throw error;
    }
  },

  getRedirectUrl: async (shortId: string) => {
    try {
      const response = await api.get(`/${shortId}`);
      return response.data;
    } catch (error) {
      console.error(`Error getting redirect URL for ${shortId}:`, error);
      throw error;
    }
  },

  generateQRCode: (shortId: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/${shortId}`;
  },

  // Toggle authentication requirement
  toggleAuthRequirement: async (shortId: string, requiresAuth: boolean) => {
    try {
      const response = await api.post(`/url/toggle-auth`, {
        shortId,
        requiresAuth,
      });
      return response.data;
    } catch (error) {
      console.error(`Error toggling auth requirement for ${shortId}:`, error);
      throw error;
    }
  },

  // Access a short URL that checks authentication
  accessShortUrl: async (shortId: string) => {
    try {
      const response = await api.get(`/${shortId}`);
      return {
        success: true,
        redirectUrl: response.data.redirectUrl,
      };
    } catch (error: any) {
      // If error is due to authentication, handle it
      if (error.response && error.response.status === 401) {
        return { success: false, needsAuth: true };
      }

      // Handle other errors
      return {
        success: false,
        error: error.response?.data?.error || "Failed to access URL",
      };
    }
  },
};

export default api;
