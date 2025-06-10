import React, { useState, useEffect } from "react";
import { urlApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import URLCard from "../../components/urlHandlers/URLcard";
import {
  FiLink,
  FiPlus,
  FiAlertCircle,
  FiBarChart2,
  FiActivity,
  FiPieChart,
} from "react-icons/fi";
import { motion } from "framer-motion";

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
  const [activeTab, setActiveTab] = useState<"links" | "analytics">("links");

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await urlApi.getUrls();

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

  // Calculate total clicks across all URLs
  const totalClicks = urls.reduce(
    (sum, url) => sum + (url.visitHistory?.length || 0),
    0
  );

  // Get date for last 7 days for summary
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  });

  // Count clicks per day for the last 7 days
  const clicksPerDay = last7Days
    .map((day) => {
      let count = 0;
      urls.forEach((url) => {
        url.visitHistory?.forEach((visit) => {
          if (visit.timestamp.startsWith(day)) {
            count++;
          }
        });
      });
      return { date: day, count };
    })
    .reverse();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, <span className="font-medium">{user?.username}</span>!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <FiLink className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-lg font-semibold text-gray-600">
                Total Links
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {urls.length}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <FiActivity className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-lg font-semibold text-gray-600">
                Total Clicks
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {totalClicks}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <FiBarChart2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-lg font-semibold text-gray-600">
                Avg. Per Link
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {urls.length > 0 ? Math.round(totalClicks / urls.length) : 0}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isCreating}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isCreating || !newUrl}
              className={`px-6 py-3 rounded-lg text-white font-medium shadow-sm ${
                isCreating || !newUrl
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              } transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
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
        </motion.div>

        <div className="mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("links")}
              className={`px-4 py-2 font-medium text-sm flex items-center mr-4 ${
                activeTab === "links"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiLink className="mr-2" /> Your Links
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 font-medium text-sm flex items-center ${
                activeTab === "analytics"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiPieChart className="mr-2" /> Analytics Overview
            </button>
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "links" ? (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiLink className="mr-2" /> Your Short URLs
              </h2>

              {isLoading ? (
                <div className="text-center py-10 bg-white rounded-xl shadow-md">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading your URLs...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl flex items-start shadow-md">
                  <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error loading URLs</p>
                    <p className="mt-1">{error}</p>
                    <button
                      onClick={fetchUrls}
                      className="mt-3 text-sm bg-white border border-red-300 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : urls.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-5 rounded-xl shadow-md">
                  <p className="font-medium">No URLs found</p>
                  <p className="mt-1">
                    You don't have any shortened URLs yet. Create your first one
                    above!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {urls.map((url, index) => (
                    <motion.div
                      key={url.shortId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <URLCard
                        url={url}
                        onDelete={handleDeleteUrl}
                        refreshUrls={fetchUrls}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Analytics Overview
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Last 7 Days Activity
                  </h3>
                  {/* Here you would integrate Chart.js for visualization */}
                  <div className="h-64 flex items-center justify-center border border-gray-200 rounded-lg bg-white">
                    <div className="space-y-4 w-full px-4">
                      {clicksPerDay.map((day, idx) => (
                        <div key={day.date} className="flex items-center">
                          <span className="w-24 text-sm text-gray-600">
                            {new Date(day.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <div className="flex-1 ml-2">
                            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                style={{
                                  width: `${Math.min(100, day.count * 5)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-600">
                            {day.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Top Performing Links
                  </h3>
                  <div className="space-y-4">
                    {urls
                      .slice(0, 5)
                      .sort(
                        (a, b) =>
                          (b.visitHistory?.length || 0) -
                          (a.visitHistory?.length || 0)
                      )
                      .map((url) => (
                        <div
                          key={url.shortId}
                          className="bg-white rounded-lg p-4 border border-gray-200"
                        >
                          <p className="text-sm font-medium text-gray-900 truncate mb-1">
                            {url.redirectUrl}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {url.shortId}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {url.visitHistory?.length || 0} clicks
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
