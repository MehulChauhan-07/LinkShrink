const urlSchema = require("../models/url_Schema");
const shortid = require("shortid");

async function handlenewShortURL(req, res) {
  try {
    const body = req.body;
    if (!body.url) {
      return res.status(400).json({ error: "URL is required" });
    }
    const userUrls = await urlSchema.find({ createdBy: req.user._id });
    const shortId = shortid.generate();
    await urlSchema.create({
      shortId: shortId,
      redirectUrl: body.url,
      visitHistory: [],
      createdBy: req.user._id,
    });
    return res.status(200).render("home", {
      ind: shortId,
      baseUrl: req.protocol + "://" + req.get("host"),
      urls: userUrls,
      user: req.user,
      isAdmin: req.user && req.user.role === "ADMIN",
      message: "URL created successfully",
    });
  } catch (error) {
    console.error("Error in handlenewShortURL:", error);
    return res.render("home", {
      urls: [], // Empty array as fallback
      error: error.message,
      user: req.user,
      isAdmin: req.user && req.user.role === "ADMIN",
    });
  }
}
async function handleRedirectUrl(req, res) {
  try {
    const { shortId } = req.params;

    // Find the URL and track the visit
    const entry = await urlSchema.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true } 
    );

    if (!entry) {
      return res.status(404).send("Short URL not found");
    }

    return res.redirect(entry.redirectUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    return res.status(500).send("Server error");
  }
}

async function handleGetAnalytics(req, res) {
  try {
    const { shortId } = req.params;
    console.log(`Fetching analytics for shortId: ${shortId}`);

    const result = await urlSchema.findOne({ shortId });

    if (!result) {
      return res.status(404).json({
        error: "URL not found",
      });
    }

    return res.status(200).json({
      visitHistory: result.visitHistory || [],
      createdAt: result.createdAt,
      redirectUrl: result.redirectUrl,
    });
  } catch (error) {
    console.error("Error in handleGetAnalytics:", error);
    return res.status(500).json({
      error: "An error occurred while fetching analytics",
    });
  }
}

async function handleRemoveUrl(req, res) {
  try {
    const { shortId } = req.params;
    const isAdmin = req.user && req.user.role === "ADMIN";

    // Build query - admin can delete any URL, regular users can only delete their own
    const query = {
      shortId,
      ...(isAdmin ? {} : { createdBy: req.user._id }),
    };

    // Delete the URL directly using findOneAndDelete
    const deletedUrl = await urlSchema.findOneAndDelete(query);

    if (!deletedUrl) {
      return res.status(404).json({
        success: false,
        error: "URL not found or you don't have permission to delete it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "URL deleted successfully",
    });
  } catch (error) {
    console.error("Error in handleDeleteUrl:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while deleting the URL",
    });
  }
}

async function handleGetUrls(req, res) {
  try {
    const isAdmin = req.user && req.user.role === "ADMIN";
    let urls;

    if (isAdmin) {
      // For admin, get all URLs with user information
      urls = await urlSchema
        .find({})
        .populate("createdBy", "username email name");
    } else {
      // For normal users, get only their URLs
      urls = await urlSchema.find({ createdBy: req.user._id });
    }

    return res.status(200).json(urls);
  } catch (error) {
    console.error("Error in handleGetUrls:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching URLs",
    });
  }
}

module.exports = {
  handlenewShortURL,
  handleRedirectUrl,
  handleGetAnalytics,
  handleRemoveUrl,
  handleGetUrls,
};
