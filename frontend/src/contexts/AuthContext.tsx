import { createContext, useContext, useEffect, useState } from "react";
import { authApi, LoginResponse } from "@services/api";

interface User {
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  signup: (
    username: string,
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isVerifying) {
      setIsVerifying(true);
      // Verify token and get user data
      authApi
        .verifyToken()
        .then((response) => {
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            // If token is invalid, clear it
            localStorage.removeItem("token");
            setUser(null);
          }
        })
        .catch(() => {
          // If verification fails, clear token
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
          setIsVerifying(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      const response = await authApi.login(usernameOrEmail, password);
      if (response.success && response.token) {
        localStorage.setItem("token", response.token);
        setUser(response.user);
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (
    username: string,
    name: string,
    email: string,
    password: string
  ) => {
    try {
      const response = await authApi.signup(username, name, email, password);
      if (response.success && response.token) {
        localStorage.setItem("token", response.token);
        setUser(response.user);
      } else {
        throw new Error("Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
