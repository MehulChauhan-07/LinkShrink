import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { urlApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const RedirectHandler: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortId) {
        setError("Invalid URL");
        setLoading(false);
        return;
      }

      try {
        // Make a single request to get the redirect URL
        const response = await urlApi.getRedirectUrl(shortId);

        if (response.success && response.redirectUrl) {
          // Use replace instead of href to prevent back button issues
          window.location.replace(response.redirectUrl);
        } else if (response.needsAuth && !user) {
          // If authentication is required and user is not logged in
          // Store the intended URL for redirection after login
          localStorage.setItem("redirectAfterLogin", `/${shortId}`);
          navigate("/login", { state: { from: `/${shortId}` } });
        } else {
          // Handle other errors
          setError(response.error || "Failed to access this URL");
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error accessing shortened URL:", err);

        // Check if the error is due to authentication requirements
        if (err.response?.status === 401 && !user) {
          localStorage.setItem("redirectAfterLogin", `/${shortId}`);
          navigate("/login", { state: { from: `/${shortId}` } });
          return;
        }

        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    handleRedirect();
  }, [shortId, navigate, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg shadow-md text-center">
          {error}
        </div>
      </div>
    );
  }

  return null;
};

export default RedirectHandler;
