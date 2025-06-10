import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiClock,
  FiExternalLink,
  FiLink,
  FiCalendar,
  FiGlobe,
} from "react-icons/fi";
import { urlApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";

interface ClickAnalytics {
  timestamp: string;
  userId?: string;
  username?: string;
}

interface UrlAnalyticsData {
  shortId: string;
  redirectUrl: string;
  createdAt: string;
  totalClicks: number;
  visitHistory: ClickAnalytics[];
}

const AnalyticsPage: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const [analytics, setAnalytics] = useState<UrlAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "history">(
    "overview"
  );

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!shortId) {
        setError("URL ID is missing");
        setLoading(false);
        return;
      }

      try {
        const data = await urlApi.getAnalytics(shortId);
        setAnalytics({
          shortId: data.shortId,
          redirectUrl: data.redirectUrl,
          createdAt: data.createdAt,
          totalClicks: data.visitHistory.length,
          visitHistory: data.visitHistory,
        });
      } catch (err: any) {
        console.error("Error fetching analytics:", err);
        setError(err.response?.data?.error || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [shortId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-6 text-gray-700 text-xl">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <p className="font-medium">Error</p>
              <p className="mt-1">{error}</p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg mb-6">
              No analytics data available
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Group clicks by date
  const clicksByDate = analytics.visitHistory.reduce(
    (acc: Record<string, number>, visit) => {
      const date = visit.timestamp.split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {}
  );

  // Format for display - get last 7 days
  const last7Days = [...Array(7)]
    .map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    })
    .reverse();

  const clicksChartData = last7Days.map((date) => ({
    date,
    clicks: clicksByDate[date] || 0,
  }));

  // Count unique users
  const uniqueUsers = new Set();
  analytics.visitHistory.forEach((visit) => {
    if (visit.userId) {
      uniqueUsers.add(visit.userId);
    } else {
      uniqueUsers.add("anonymous");
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5">
            <h2 className="text-2xl font-bold text-white">
              Link Analytics: {analytics.shortId}
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FiExternalLink className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-500">
                      Original URL
                    </h3>
                    <p className="text-base font-medium text-gray-900 break-all">
                      <a
                        href={analytics.redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {analytics.redirectUrl}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FiLink className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-500">
                      Short URL
                    </h3>
                    <p className="text-base font-medium text-blue-600">
                      {`${window.location.origin}/${analytics.shortId}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-500">
                      Created At
                    </h3>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(analytics.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FiGlobe className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-500">
                      Total Clicks
                    </h3>
                    <p className="text-base font-medium text-gray-900">
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {analytics.totalClicks} clicks
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 font-medium text-sm mr-4 ${
                    activeTab === "overview"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === "history"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Click History
                </button>
              </div>

              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "overview" ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        7-Day Click Performance
                      </h3>
                      <div className="h-64 flex items-center justify-center">
                        <div className="space-y-4 w-full px-4">
                          {clicksChartData.map((day, idx) => (
                            <div key={day.date} className="flex items-center">
                              <span className="w-24 text-sm text-gray-600">
                                {new Date(day.date).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" }
                                )}
                              </span>
                              <div className="flex-1 ml-2">
                                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        day.clicks * 10
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <span className="ml-2 text-sm font-medium text-gray-600">
                                {day.clicks}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          User Information
                        </h3>
                        <div className="flex items-center">
                          <div className="p-3 bg-blue-100 rounded-full mr-4">
                            <FiUser className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Unique Visitors
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              {uniqueUsers.size}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Recent Activity
                        </h3>
                        {analytics.visitHistory.length > 0 ? (
                          <div className="space-y-3">
                            {analytics.visitHistory
                              .slice(0, 3)
                              .map((visit, idx) => (
                                <div key={idx} className="flex items-start">
                                  <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                      <FiUser className="h-4 w-4 text-blue-600" />
                                    </div>
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">
                                      {visit.username || "Anonymous"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(
                                        visit.timestamp
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No recent activity</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Click History
                    </h3>

                    {analytics.visitHistory.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                #
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                <div className="flex items-center">
                                  <FiClock className="mr-2" /> Time
                                </div>
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                <div className="flex items-center">
                                  <FiUser className="mr-2" /> User
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {analytics.visitHistory.map((visit, index) => (
                              <tr
                                key={index}
                                className={
                                  index % 2 === 0
                                    ? "bg-white hover:bg-gray-50"
                                    : "bg-gray-50 hover:bg-gray-100"
                                }
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(visit.timestamp).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {visit.username ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      {visit.username}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      Anonymous
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg">
                        No clicks recorded yet
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
