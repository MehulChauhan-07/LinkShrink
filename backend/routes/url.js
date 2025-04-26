const express = require("express");
const {
  handlenewShortURL,
  handleRedirectUrl,
  handleGetAnalytics,
  handleRemoveUrl,
} = require("../controller/url_control");

const router = express.Router();

router
  .get("/:shortId", handleRedirectUrl)
  .get("/analytics/:shortId", handleGetAnalytics);

router.post("/", handlenewShortURL);
router.delete("/delete/:shortId", handleRemoveUrl);
module.exports = router;
