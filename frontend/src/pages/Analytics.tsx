import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { urlApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import React from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
// Define the types for your API response
interface Visit {
  timestamp: string | number | Date;
  // Add other visit properties if any
}

interface AnalyticsData {
  visitHistory: Visit[];
  createdAt: string;
  // Add other properties from your analytics response
}
export default function Analytics() {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", shortId],
    queryFn: () => urlApi.getAnalytics(shortId!),
    meta: {
      onSuccess: (data: AnalyticsData) => {
        console.log("Analytics API response:", data);
      },
    },
  });

  // Add this to debug:
  React.useEffect(() => {
    if (analytics) {
      console.log("Analytics data:", analytics);
      console.log("Visit history:", analytics.visitHistory);
      console.log("Visit count:", analytics.visitHistory?.length || 0);
    }
  }, [analytics]);

  const chartData = {
    labels:
      analytics?.visitHistory?.map((visit: Visit) =>
        new Date(visit.timestamp).toLocaleDateString()
      ) || [],
    datasets: [
      {
        label: "Visits",
        data: analytics?.visitHistory?.map(() => 1) || [],
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Visit History",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">
                  LinkShrink
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                Welcome, {user?.username}
              </span>
              <button
                onClick={() => navigate("/")}
                className="text-gray-700 hover:text-gray-900 mr-4"
              >
                Home
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-gray-700 hover:text-gray-900 mr-4"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Analytics for {shortId}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Visits
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-indigo-600">
                    {analytics?.visitHistory?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Created At
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(analytics?.createdAt || "").toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Visit History
              </h3>
              <div className="h-96">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
