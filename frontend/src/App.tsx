import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";

// Components
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import RedirectHandler from "./components/RedirectHandler";

// Pages
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotFoundPage from "./pages/NotFoundPage";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={<PrivateRoute element={<DashboardPage />} />}
              />
              <Route
                path="/analytics/:shortId"
                element={<PrivateRoute element={<AnalyticsPage />} />}
              />

              {/* Redirect handler for shortened URLs */}
              <Route path="/:shortId" element={<RedirectHandler />} />

              {/* 404 route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
