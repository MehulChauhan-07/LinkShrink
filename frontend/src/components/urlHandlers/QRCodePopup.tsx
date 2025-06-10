import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload, FiX, FiCopy } from "react-icons/fi";

interface QRCodePopupProps {
  isOpen: boolean;
  onClose: () => void;
  shortId: string;
}

const QRCodePopup: React.FC<QRCodePopupProps> = ({
  isOpen,
  onClose,
  shortId,
}) => {
  const [copied, setCopied] = useState(false);

  const shortUrl = `${window.location.origin}/${shortId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    shortUrl
  )}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qrcode-${shortId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">QR Code</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm mb-4">
                <img
                  src={qrCodeUrl}
                  alt={`QR Code for ${shortId}`}
                  className="w-56 h-56 object-contain"
                />
              </div>

              <div className="mb-4 text-center">
                <p className="text-sm text-gray-500 mb-1">
                  Scan this QR code to access your link:
                </p>
                <div className="flex items-center justify-center bg-gray-100 rounded-lg px-3 py-2 w-full">
                  <span className="text-gray-900 text-sm mr-2 truncate">
                    {shortUrl}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="flex-shrink-0 text-gray-500 hover:text-blue-600 focus:outline-none"
                    title="Copy to clipboard"
                  >
                    <FiCopy className="h-4 w-4" />
                  </button>
                </div>
                {copied && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-green-600 mt-1"
                  >
                    Copied to clipboard!
                  </motion.p>
                )}
              </div>

              <div className="flex justify-center w-full">
                <button
                  onClick={downloadQRCode}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiDownload className="mr-2 h-5 w-5" />
                  Download QR Code
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QRCodePopup;
