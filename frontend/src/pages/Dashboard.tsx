import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { urlApi } from "../services/api";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: urls, isLoading } = useQuery({
    queryKey: ["urls"],
    queryFn: urlApi.getUrls,
  });

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
                onClick={logout}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Logout
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
                User Information
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Username</p>
                  <p className="mt-1 text-sm text-gray-900">{user?.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="mt-1 text-sm text-gray-900">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                URL Statistics
              </h3>
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-indigo-600">
                      Total URLs
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-indigo-900">
                      {urls?.length || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-600">
                      Total Clicks
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-green-900">
                      {urls?.reduce(
                        (acc, url) => acc + url.visitHistory.length,
                        0
                      ) || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-purple-600">
                      Average Clicks
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-purple-900">
                      {urls?.length
                        ? Math.round(
                            urls.reduce(
                              (acc, url) => acc + url.visitHistory.length,
                              0
                            ) / urls.length
                          )
                        : 0}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent URLs
            </h3>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {urls?.slice(0, 5).map((url) => (
                    <li key={url.shortId}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {`${window.location.origin}/${url.shortId}`}
                            </p>
                            <p className="mt-1 text-sm text-gray-500 truncate">
                              {url.redirectUrl}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Clicks: {url.visitHistory.length}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              onClick={() =>
                                navigate(`/url/analytics/${url.shortId}`)
                              }
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200"
                            >
                              View Analytics
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
