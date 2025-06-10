import React, { useState, useEffect } from "react";
import { urlApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import URLCard from "../../components/urlHandlers/URLcard";
import { FiLink, FiPlus, FiAlertCircle } from "react-icons/fi";

interface URL {
  shortId: string;
  redirectUrl: string;
  createdAt: string;
  visitHistory: Array<{ timestamp: string }>;
  requiresAuth?: boolean;
}

const DashboardPage: React.FC = () => {
  const [urls, setUrls] = useState<URL[]>([]);
  const [newUrl, setNewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching URLs...");
      const response = await urlApi.getUrls();
      console.log("API Response:", response);

      // Check if response is an array - if not, handle accordingly
      if (Array.isArray(response)) {
        setUrls(response);
      } else if (
        response &&
        typeof response === "object" &&
        Array.isArray(response.urls)
      ) {
        // If the response is wrapped in an object with a urls property
        setUrls(response.urls);
      } else {
        console.error("Invalid response format:", response);
        throw new Error("Invalid response format from server");
      }
    } catch (err: any) {
      console.error("Error fetching URLs:", err);
      setError(
        err?.response?.data?.error ||
          "Failed to load your URLs. Please try again later."
      );
      toast.error("Failed to load your shortened URLs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUrl = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUrl) {
      toast.warning("Please enter a valid URL");
      return;
    }

    // Add protocol if missing
    let urlToShorten = newUrl;
    if (
      !urlToShorten.startsWith("http://") &&
      !urlToShorten.startsWith("https://")
    ) {
      urlToShorten = "https://" + urlToShorten;
    }

    setIsCreating(true);
    setError(null);

    try {
      await urlApi.createShortUrl(urlToShorten);
      setNewUrl("");
      toast.success("URL shortened successfully!");
      fetchUrls();
    } catch (err: any) {
      console.error("Error creating short URL:", err);
      setError(
        err?.response?.data?.error ||
          "Failed to create short URL. Please try again."
      );
      toast.error("Failed to create short URL");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUrl = async (shortId: string) => {
    try {
      await urlApi.deleteUrl(shortId);
      setUrls(urls.filter((url) => url.shortId !== shortId));
      return true;
    } catch (err: any) {
      console.error("Error deleting URL:", err);
      toast.error(err?.response?.data?.error || "Failed to delete URL");
      return false;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, <span className="font-medium">{user?.username}</span>!
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FiPlus className="mr-2" /> Create New Short URL
        </h2>

        <form
          onSubmit={handleCreateUrl}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLink className="text-gray-400" />
              </div>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Enter URL to shorten (example.com)"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isCreating}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isCreating || !newUrl}
            className={`px-4 py-2 rounded-md text-white font-medium shadow-sm ${
              isCreating || !newUrl
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isCreating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Shorten URL"
            )}
          </button>
        </form>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <FiLink className="mr-2" /> Your Short URLs
        </h2>

        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your URLs...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
            <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading URLs</p>
              <p>{error}</p>
              <button
                onClick={fetchUrls}
                className="mt-2 text-sm bg-red-100 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : urls.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
            You don't have any shortened URLs yet. Create your first one above!
          </div>
        ) : (
          <div>
            {urls.map((url) => (
              <URLCard
                key={url.shortId}
                url={url}
                onDelete={handleDeleteUrl}
                refreshUrls={fetchUrls}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
