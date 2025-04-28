const urlSchema = require("../models/url_Schema");

/**
 * Handles setting expiration date for a URL
 */
async function handleSetExpirationDate(req, res) {
  try {
    const { shortId, expirationDate } = req.body;

    if (!shortId) {
      return res.status(400).json({
        success: false,
        error: "Short URL ID is required",
      });
    }

    const url = await urlSchema.findOne({
      shortId,
      createdBy: req.user._id, // Ensure the URL belongs to the current user
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        error: "URL not found or you don't have permission to modify it",
      });
    }

    // Set or remove expiration date
    if (expirationDate) {
      const expDate = new Date(expirationDate);

      // Validate that the date is in the future
      if (expDate <= new Date()) {
        return res.status(400).json({
          success: false,
          error: "Expiration date must be in the future",
        });
      }

      url.expirationDate = expDate;
    } else {
      url.expirationDate = null; // Remove expiration
    }

    await url.save();

    return res.status(200).json({
      success: true,
      message: expirationDate
        ? "Expiration date set successfully"
        : "Expiration date removed",
    });
  } catch (error) {
    console.error("Error in handleSetExpirationDate:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update expiration date",
    });
  }
}

/**
 * Middleware to check if a URL has expired
 */
async function checkUrlExpiration(req, res, next) {
  try {
    const { shortId } = req.params;

    const url = await urlSchema.findOne({ shortId });

    if (!url) {
      return next(); // Let the main handler deal with non-existent URLs
    }

    // Check if the URL has expired
    if (url.expirationDate && new Date() > new Date(url.expirationDate)) {
      // If the request is API based
      if (req.headers.accept === "application/json") {
        return res.status(410).json({
          success: false,
          error: "This link has expired",
        });
      }

      // If browser request, render an expiration page
      return res.status(410).render("expired", {
        message: "This link has expired and is no longer available.",
      });
    }

    // URL has not expired, continue to the next middleware
    next();
  } catch (error) {
    console.error("Error in checkUrlExpiration:", error);
    next(error);
  }
}

module.exports = {
  handleSetExpirationDate,
  checkUrlExpiration,
};
