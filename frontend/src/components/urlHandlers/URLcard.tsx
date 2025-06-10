import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCopy,
  FiBarChart2,
  FiTrash2,
  FiExternalLink,
  FiCode,
} from "react-icons/fi";
import { motion } from "framer-motion";
import QRCodePopup from "./QRCodePopup";

interface URL {
  shortId: string;
  redirectUrl: string;
  createdAt: string;
  visitHistory: Array<{ timestamp: string }>;
  requiresAuth?: boolean;
}

interface URLCardProps {
  url: URL;
  onDelete: (shortId: string) => Promise<boolean>;
  refreshUrls: () => void;
}

const URLCard: React.FC<URLCardProps> = ({ url, onDelete, refreshUrls }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const shortUrl = `${window.location.origin}/${url.shortId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this URL?")) {
      setIsDeleting(true);
      try {
        await onDelete(url.shortId);
        refreshUrls();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
        whileHover={{ y: -2 }}
      >
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiExternalLink className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-md mb-1">
                    {url.redirectUrl}
                  </p>
                  <div className="flex items-center">
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {shortUrl}
                    </a>
                    <button
                      onClick={handleCopy}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      aria-label="Copy short URL"
                    >
                      <FiCopy className="h-4 w-4" />
                    </button>
                    {copied && (
                      <span className="ml-2 text-xs text-green-600">
                        Copied!
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span className="flex items-center">
                      <span className="mr-1">Created:</span>
                      {new Date(url.createdAt).toLocaleString()}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <span className="mr-1">Clicks:</span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {url.visitHistory.length}
                      </span>
                    </span>
                    {url.requiresAuth && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          Auth Required
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:justify-end">
              <button
                onClick={() => setShowQRCode(true)}
                className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FiCode className="h-4 w-4" /> QR Code
              </button>
              <button
                onClick={() => navigate(`/analytics/${url.shortId}`)}
                className="inline-flex items-center gap-1 px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
              >
                <FiBarChart2 className="h-4 w-4" /> Analytics
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`inline-flex items-center gap-1 px-3 py-2 border border-transparent text-sm font-medium rounded-lg ${
                  isDeleting
                    ? "bg-red-300 cursor-not-allowed"
                    : "text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                } shadow-sm transition-colors`}
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    <FiTrash2 className="h-4 w-4" /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <QRCodePopup
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        shortId={url.shortId}
      />
    </>
  );
};

export default URLCard;
