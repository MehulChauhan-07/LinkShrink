import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiUser, FiClock } from "react-icons/fi";
import { urlApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

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
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-700">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
          No analytics data available
        </div>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link
        to="/dashboard"
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Link Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="mb-2">
                <span className="block font-semibold text-gray-600">
                  Original URL:
                </span>
                <a
                  href={analytics.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 break-all"
                >
                  {analytics.redirectUrl}
                </a>
              </p>
              <p className="mb-2">
                <span className="block font-semibold text-gray-600">
                  Short ID:
                </span>
                <span className="text-gray-800">{analytics.shortId}</span>
              </p>
            </div>
            <div>
              <p className="mb-2">
                <span className="block font-semibold text-gray-600">
                  Created At:
                </span>
                <span className="text-gray-800">
                  {new Date(analytics.createdAt).toLocaleString()}
                </span>
              </p>
              <p className="mb-2">
                <span className="block font-semibold text-gray-600">
                  Total Clicks:
                </span>
                <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-sm font-medium">
                  {analytics.totalClicks}
                </span>
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Click History
          </h3>

          {analytics.visitHistory.length > 0 ? (
            <div className="overflow-x-auto">
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
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(visit.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {visit.username ? (
                          <span className="text-gray-900">
                            {visit.username}
                          </span>
                        ) : (
                          <span className="text-gray-400">Anonymous</span>
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
      </div>
    </div>
  );
};

export default AnalyticsPage;
