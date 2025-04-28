import React, { useState } from "react";
import {
  FiCopy,
  FiExternalLink,
  FiBarChart2,
  FiTrash2,
  FiQrCode,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { urlApi, UrlData } from "../services/api";

interface URLCardProps {
  url: UrlData;
  onDelete: (shortId: string) => Promise<boolean>;
  refreshUrls: () => void;
}

const URLCard: React.FC<URLCardProps> = ({ url, onDelete, refreshUrls }) => {
  const [copying, setCopying] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const navigate = useNavigate();

  const baseUrl = window.location.origin;
  const shortUrl = `${baseUrl}/${url.shortId}`;
  const clickCount = url.visitHistory?.length || 0;

  console.log("URL Card Data:", url);

  const copyToClipboard = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(shortUrl);
      toast.success("URL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy URL");
      console.error("Failed to copy:", error);
    } finally {
      setCopying(false);
    }
  };

  const openInNewTab = () => {
    // Open the shortened URL in a new tab
    window.open(shortUrl, "_blank", "noopener,noreferrer");
  };

  const viewAnalytics = () => {
    navigate(`/analytics/${url.shortId}`);
  };

  const handleDelete = async () => {
    if (deleting) return;
    try {
      setDeleting(true);
      const success = await onDelete(url.shortId);
      if (success) {
        toast.success("URL deleted successfully");
        refreshUrls();
      }
    } catch (error) {
      console.error("Error deleting URL:", error);
      toast.error("Failed to delete URL");
    } finally {
      setDeleting(false);
    }
  };

  // Generate QR code using the QR server API
  const qrCodeUrl = urlApi.generateQRCode(url.shortId);

  return (
    <div className="bg-white rounded-lg shadow-md mb-4 p-4 transition-all hover:shadow-lg">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="w-full md:w-2/3 pr-4">
          <h5 className="text-lg font-semibold mb-2 truncate">
            <a
              href={url.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 no-underline"
            >
              {url.redirectUrl}
            </a>
          </h5>
          <p className="text-sm mb-2">
            <span className="text-gray-500">Short URL: </span>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-600"
            >
              {shortUrl}
            </a>
          </p>
          <div className="flex items-center mb-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
              {clickCount} {clickCount === 1 ? "click" : "clicks"}
            </span>
            <span className="text-gray-500 text-xs">
              Created: {new Date(url.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="w-full md:w-1/3 mt-4 md:mt-0 flex flex-wrap justify-start md:justify-end items-center">
          <button
            onClick={copyToClipboard}
            disabled={copying}
            className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 mr-2 mb-2 transition-colors disabled:opacity-50"
          >
            <FiCopy className="mr-1" /> Copy
          </button>

          <button
            onClick={openInNewTab}
            className="flex items-center bg-white border border-green-300 rounded-md px-3 py-1.5 text-sm text-green-700 hover:bg-green-50 mr-2 mb-2 transition-colors"
          >
            <FiExternalLink className="mr-1" /> Open
          </button>

          <button
            onClick={viewAnalytics}
            className="flex items-center bg-white border border-blue-300 rounded-md px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50 mr-2 mb-2 transition-colors"
          >
            <FiBarChart2 className="mr-1" /> Stats
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center bg-white border border-red-300 rounded-md px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 mb-2 transition-colors disabled:opacity-50"
          >
            <FiTrash2 className="mr-1" /> {deleting ? "Deleting..." : "Delete"}
          </button>

          {/* QR Code - Can be viewed in a modal or tooltip */}
          <div className="w-full md:w-auto mt-2 md:mt-0">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-20 h-20 mx-auto md:mx-0"
              title="Scan this QR code to open the short URL"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default URLCard;
