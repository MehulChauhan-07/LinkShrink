require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { checkForAuthorization, restrictTo } = require("./middleware/auth");
const { checkUrlExpiration } = require("./controller/url_expiry");
const staticRoute = require("./routes/staticRoute");
const urlRouter = require("./routes/url");
const userRouter = require("./routes/user");
const qrRouter = require("./routes/qr");
const URL = require("./models/url_Schema");

const app = express();
// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  console.log("Request Headers:", req.headers);
  next();
});

// Middleware to handle favicon.ico requests
app.get("/favicon.ico", (req, res) => res.status(204).end());

// View engine setup
app.set("view engine", "ejs").set("views", path.resolve("./src/views"));

// Public routes (no authentication required)
app.get("/:shortId", checkUrlExpiration, async (req, res, next) => {
  try {
    const { shortId } = req.params;

    // Skip handling for known routes
    if (["login", "signup", "dashboard", "favicon.ico"].includes(shortId)) {
      return next();
    }

    // Find the URL
    const entry = await URL.findOne({ shortId });

    if (!entry) {
      // If not found, proceed to next middleware/route
      return next();
    }

    // Check if the URL is password protected
    if (entry.isPasswordProtected) {
      // If API request, return need-password status
      if (req.headers.accept === "application/json") {
        return res.status(401).json({
          success: false,
          needPassword: true,
          message: "This URL is password protected",
        });
      }

      // If browser request, show password prompt
      return res.render("password-prompt", { shortId });
    }

    // If not password protected, track the visit
    await URL.findOneAndUpdate(
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

    // Handle API requests
    if (req.headers.accept === "application/json") {
      return res.json({
        success: true,
        redirectUrl: entry.redirectUrl,
      });
    }

    // Handle browser requests
    return res.redirect(entry.redirectUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    return next();
  }
});

// Protected routes (authentication required)
app.use(checkForAuthorization);
app.use("/", staticRoute);
app.use("/url", restrictTo(["NORMAL", "ADMIN"]), urlRouter);
app.use("/user", userRouter);
app.use("/qr", qrRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
  });
});

module.exports = app;
