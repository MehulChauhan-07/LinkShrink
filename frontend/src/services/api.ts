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

// Add a request interceptor to add the token to requests
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

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
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
  visitHistory: { timestamp: string }[];
  createdAt: string;
  createdBy: {
    username: string;
    email: string;
    name: string;
  };
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
    const response = await api.post<UrlResponse>("/url", { url });
    return response.data;
  },

  getUrls: async () => {
    const response = await api.get<UrlResponse[]>("/url");
    return response.data;
  },

  deleteUrl: async (shortId: string) => {
    const response = await api.delete(`/url/${shortId}`);
    return response.data;
  },

  getAnalytics: async (shortId: string) => {
    const response = await api.get(`/url/analytics/${shortId}`);
    return response.data;
  },

  getRedirectUrl: async (shortId: string) => {
    const response = await api.get(`/url/${shortId}`);
    return response.data;
  },

  generateQRCode: (shortId: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/${shortId}`;
  },
};

export default api;
