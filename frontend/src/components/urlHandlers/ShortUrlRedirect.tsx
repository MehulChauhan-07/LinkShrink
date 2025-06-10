import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

export default function ShortUrlRedirect() {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirectToUrl = async () => {
      try {
        // Make a request to the backend's redirect endpoint
        const response = await axios.get(`http://localhost:3000/${shortId}`, {
          // Prevent axios from following redirects
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400,
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        // If we get a redirect response, follow it
        if (response.status === 302 || response.status === 301) {
          window.location.href = response.headers.location;
        } else if (response.data && response.data.redirectUrl) {
          // If we get the URL in the response body
          window.location.href = response.data.redirectUrl;
        } else {
          setError("URL not found");
        }
      } catch (err) {
        console.error("Redirect error:", err);
        if (err instanceof AxiosError) {
          if (err.response?.status === 404) {
            setError("URL not found");
          } else if (err.code === "ERR_NETWORK") {
            setError("Network error. Please check your connection.");
          } else {
            setError("Failed to redirect. Please try again.");
          }
        } else {
          setError("An unexpected error occurred.");
        }
      }
    };

    if (shortId) {
      redirectToUrl();
    }
  }, [shortId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
