const express = require("express");
const {
  handlenewShortURL,
  handleRedirectUrl,
  handleGetAnalytics,
} = require("../controller/url_control");

const router = express.Router();

router
  .post("/", handlenewShortURL)
  .get("/:shortId", handleRedirectUrl)
  .get("/analytics/:shortId", handleGetAnalytics);

module.exports = router;
