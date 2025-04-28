const urlSchema = require("../models/url_Schema_updated");
const bcrypt = require("bcrypt");

/**
 * Handles setting password protection for a URL
 */
async function handleSetPasswordProtection(req, res) {
  try {
    const { shortId, password, isProtected } = req.body;

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

    // If setting protection
    if (isProtected === true && password) {
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
      url.password = hashedPassword;
      url.isPasswordProtected = true;
    }
    // If removing protection
    else if (isProtected === false) {
      url.password = null;
      url.isPasswordProtected = false;
    }
    // Invalid request
    else {
      return res.status(400).json({
        success: false,
        error: "Password is required when enabling protection",
      });
    }

    await url.save();

    return res.status(200).json({
      success: true,
      message: isProtected
        ? "Password protection enabled"
        : "Password protection disabled",
    });
  } catch (error) {
    console.error("Error in handleSetPasswordProtection:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update password protection",
    });
  }
}

/**
 * Handles verifying password for a protected URL
 */
async function handleVerifyPassword(req, res) {
  try {
    const { shortId, password } = req.body;

    if (!shortId || !password) {
      return res.status(400).json({
        success: false,
        error: "Both short URL ID and password are required",
      });
    }

    const url = await urlSchema.findOne({ shortId });

    if (!url) {
      return res.status(404).json({
        success: false,
        error: "URL not found",
      });
    }

    if (!url.isPasswordProtected) {
      return res.status(400).json({
        success: false,
        error: "This URL is not password protected",
      });
    }

    // Check if password matches
    const isPasswordCorrect = await bcrypt.compare(password, url.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: "Incorrect password",
      });
    }

    // Password is correct, return the redirect URL
    return res.status(200).json({
      success: true,
      redirectUrl: url.redirectUrl,
    });
  } catch (error) {
    console.error("Error in handleVerifyPassword:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to verify password",
    });
  }
}

module.exports = {
  handleSetPasswordProtection,
  handleVerifyPassword,
};
