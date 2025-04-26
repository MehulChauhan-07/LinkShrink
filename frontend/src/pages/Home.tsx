import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { urlApi } from "../services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import QRCodePopup from "../components/QRCodePopup";

const urlSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

type UrlFormData = z.infer<typeof urlSchema>;

export default function Home() {
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
    },
    onError: () => {
      setError("Failed to create short URL. Please try again.");
    },
  });

  const deleteUrlMutation = useMutation({
    mutationFn: urlApi.deleteUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
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
    setTimeout(() => setCopiedUrl(null), 2000);
  };

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
                onClick={() => navigate("/dashboard")}
                className="text-gray-700 hover:text-gray-900 mr-4"
              >
                Dashboard
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
                Create Short URL
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}
                <div>
                  <label htmlFor="url" className="sr-only">
                    URL
                  </label>
                  <input
                    {...register("url")}
                    type="text"
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      "Create Short URL"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Your Short URLs
              </h3>
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
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
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {url.redirectUrl}
                            </p>
                            <p className="text-sm text-gray-500">
                              {`${window.location.origin}/${url.shortId}`}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUrl(url.shortId);
                                setIsQRCodeOpen(true);
                              }}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                            >
                              QR Code
                            </button>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `${window.location.origin}/${url.shortId}`
                                )
                              }
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                            >
                              {copiedUrl ===
                              `${window.location.origin}/${url.shortId}`
                                ? "Copied!"
                                : "Copy"}
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/analytics/${url.shortId}`)
                              }
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                            >
                              Analytics
                            </button>
                            <button
                              onClick={() => handleDelete(url.shortId)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
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
