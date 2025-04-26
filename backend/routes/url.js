const express = require("express");
const {
  handlenewShortURL,
  handleRedirectUrl,
  handleGetAnalytics,
  handleRemoveUrl,
  handleGetUrls,
} = require("../controller/url_control");

const router = express.Router();

router
  .get("/:shortId", handleRedirectUrl)
  .get("/analytics/:shortId", handleGetAnalytics);

router.post("/", handlenewShortURL);
router.delete("/:shortId", handleRemoveUrl);
router.get("/", handleGetUrls);

module.exports = router;
