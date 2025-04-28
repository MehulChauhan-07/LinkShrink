const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

/**
 * Generates QR code for a given URL and returns the data URL
 * @param {string} url - The URL to encode in the QR code
 * @returns {Promise<string>} - The QR code as a data URL
 */
async function generateQRCode(url) {
  try {
    // Generate QR code as data URL
    const qrDataURL = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000", // Black dots
        light: "#ffffff", // White background
      },
      errorCorrectionLevel: "H", // High error correction level
    });

    return qrDataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

/**
 * Handles QR code generation request
 */
async function handleQRCodeGeneration(req, res) {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    const qrDataURL = await generateQRCode(url);

    return res.status(200).json({
      success: true,
      qrCode: qrDataURL,
    });
  } catch (error) {
    console.error("Error in handleQRCodeGeneration:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to generate QR code",
    });
  }
}

/**
 * Generates a QR code image file and returns the file path
 * @param {string} url - The URL to encode in the QR code
 * @param {string} filename - The filename for the QR code image
 * @returns {Promise<string>} - Path to the generated QR code image
 */
async function generateQRCodeFile(url, filename) {
  try {
    // Create directory if it doesn't exist
    const qrDirectory = path.join(__dirname, "../../public/qrcodes");
    if (!fs.existsSync(qrDirectory)) {
      fs.mkdirSync(qrDirectory, { recursive: true });
    }

    const filePath = path.join(qrDirectory, `${filename}.png`);

    // Generate QR code and save to file
    await QRCode.toFile(filePath, url, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    return `/qrcodes/${filename}.png`;
  } catch (error) {
    console.error("Error generating QR code file:", error);
    throw error;
  }
}

module.exports = {
  handleQRCodeGeneration,
  generateQRCode,
  generateQRCodeFile,
};
