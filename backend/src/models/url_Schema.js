const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
    },
    redirectUrl: {
      type: String,
      required: true,
    },
    visitHistory: [{ timestamp: { type: [Date], default: [] } }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    qrCodePath: {
      type: String,
      default: null,
    },
    // Adding expirationDate for URL expiry feature
    expirationDate: {
      type: Date,
      default: null,
    },
    // Adding isPasswordProtected and password fields for password protection
    isPasswordProtected: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const URL = mongoose.model("URL", urlSchema);

module.exports = URL;
