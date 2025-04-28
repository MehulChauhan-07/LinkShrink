const express = require("express");
const { handleQRCodeGeneration } = require("../controller/qr_generator");
const { checkForAuthorization, restrictTo } = require("../middleware/auth");

const router = express.Router();

// Route to generate QR code
router.post(
  "/generate",
  checkForAuthorization,
  restrictTo(["NORMAL", "ADMIN"]),
  handleQRCodeGeneration
);

module.exports = router;
