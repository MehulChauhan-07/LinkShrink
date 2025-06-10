import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { urlApi } from "@services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import QRCodePopup from "@components/urlHandlers/QRCodePopup";
import { FiLink2, FiCopy, FiBarChart2, FiTrash2, FiCode } from "react-icons/fi";

const urlSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

type UrlFormData = z.infer<typeof urlSchema>;

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
  });

  const { data: urls, isLoading } = useQuery({
    queryKey: ["urls"],
    queryFn: urlApi.getUrls,
  });

  const createUrlMutation = useMutation({
    mutationFn: urlApi.createShortUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      reset();
      toast.success("URL shortened successfully!");
    },
    onError: () => {
      setError("Failed to create short URL. Please try again.");
      toast.error("Failed to create short URL");
    },
  });

  const deleteUrlMutation = useMutation({
    mutationFn: urlApi.deleteUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      toast.success("URL deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete URL");
    },
  });

  const onSubmit = async (data: UrlFormData) => {
    try {
      await createUrlMutation.mutateAsync(data.url);
    } catch (err) {
      setError("Failed to create short URL. Please try again.");
    }
  };

  const handleDelete = async (shortId: string) => {
    if (window.confirm("Are you sure you want to delete this URL?")) {
      try {
        await deleteUrlMutation.mutateAsync(shortId);
      } catch (err) {
        setError("Failed to delete URL. Please try again.");
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Modern Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                LinkShrink
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:inline-block text-gray-700 mr-4">
                Welcome, {user?.username}
              </span>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-md hover:shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden"
        >
          <div className="md:flex">
            <div className="md:w-1/2 p-6 md:p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Create Short URL
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLink2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("url")}
                    type="text"
                    className="appearance-none rounded-lg block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    placeholder="Enter URL to shorten"
                  />
                  {errors.url && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.url.message}
                    </p>
                  )}
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-all"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent border-white"></div>
                    ) : (
                      "Create Short URL"
                    )}
                  </button>
                </div>
              </form>
            </div>
            <div className="md:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 md:p-8 text-white flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Shrink Your Links</h3>
              <p className="mb-4">
                Create short, memorable links that are easy to share and track.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Easy to share
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Track clicks and views
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Generate QR codes
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Your Short URLs
            </h3>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {urls?.map((url) => (
                    <motion.div
                      key={url.shortId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      className="bg-gray-50 hover:bg-gray-100 rounded-lg p-5 transition-all shadow-sm hover:shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {url.redirectUrl}
                          </p>
                          <p className="text-sm text-indigo-600 font-medium flex items-center gap-1">
                            <FiLink2 className="h-4 w-4" />
                            {`${window.location.origin}/${url.shortId}`}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setSelectedUrl(url.shortId);
                              setIsQRCodeOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
                          >
                            <FiCode className="h-4 w-4" /> QR Code
                          </button>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                `${window.location.origin}/${url.shortId}`
                              )
                            }
                            className="inline-flex items-center gap-1 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                          >
                            <FiCopy className="h-4 w-4" />
                            {copiedUrl ===
                            `${window.location.origin}/${url.shortId}`
                              ? "Copied!"
                              : "Copy"}
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/analytics/${url.shortId}`)
                            }
                            className="inline-flex items-center gap-1 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                          >
                            <FiBarChart2 className="h-4 w-4" /> Analytics
                          </button>
                          <button
                            onClick={() => handleDelete(url.shortId)}
                            className="inline-flex items-center gap-1 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                          >
                            <FiTrash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {urls?.length === 0 && (
                  <div className="bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-lg text-center">
                    You don't have any shortened URLs yet. Create your first one
                    above!
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {selectedUrl && (
        <QRCodePopup
          isOpen={isQRCodeOpen}
          onClose={() => {
            setIsQRCodeOpen(false);
            setSelectedUrl(null);
          }}
          shortId={selectedUrl}
        />
      )}
    </div>
  );
}
