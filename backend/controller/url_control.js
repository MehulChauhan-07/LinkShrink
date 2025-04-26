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
      id: shortId,
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
  const shortId = req.params.shortId;
  const entry = await urlSchema.findOneAndUpdate(
    {
      shortId,
    },
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
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;
  const result = await urlSchema.findOne({ shortId });
  return res.status(200).json({
    totolClicks: result.visitHistory.length,
    Analytics: result.visitHistory,
  });
}
module.exports = {
  handlenewShortURL,
  handleRedirectUrl,
  handleGetAnalytics,
};
