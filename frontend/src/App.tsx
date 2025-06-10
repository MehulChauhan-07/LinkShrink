import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";

// Components
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RedirectHandler from "./components/urlHandlers/RedirectHandler";

// Pages
// import HomePage from "./pages/Homepage_v0";
import HomePage from "./pages/HomePage";
// import DashboardPage from "./pages/dashboard/DashboardPage_v0";
import DashboardPage from "./pages/dashboard/DashboardPage";
// import AnalyticsPage from "./pages/analytics/AnalyticsPage_v0";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import NotFoundPage from "./pages/common/NotFoundPage";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        {/* <div className="min-h-screen bg-background text-foreground transition-colors duration-200"> */}
          <Navbar />
          {/* <main className="container mx-auto px-4 py-8"> */}
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/"
                element={<ProtectedRoute element={<HomePage />} />}
              />
              <Route
                path="/dashboard"
                element={<ProtectedRoute element={<DashboardPage />} />}
              />
              <Route
                path="/analytics/:shortId"
                element={<ProtectedRoute element={<AnalyticsPage />} />}
              />
              <Route path="/:shortId" element={<RedirectHandler />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          {/* </main> */}
        {/* </div> */}
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--background)",
            color: "var(--foreground)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;
