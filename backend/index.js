require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const URL = require("./models/url_Schema");
const { connectToMongoDB } = require("./mongo_config");

const { checkForAuthorization, restrictTo } = require("./midddelware/auth");
const staticRoute = require("./routes/staticRoute");
const testRouter = require("./routes/test");
const urlRouter = require("./routes/url");
const userRouter = require("./routes/user");

connectToMongoDB("mongodb://localhost:27017/url_shortener_jwt")
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Vite's default port
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(express.static(path.join(__dirname, "public")));
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
app.set("view engine", "ejs").set("views", path.resolve("./views"));

// Public routes (no authentication required)
app.get("/:shortId", async (req, res, next) => {
  try {
    const { shortId } = req.params;

    // Skip handling for known routes
    if (["login", "signup", "dashboard", "favicon.ico"].includes(shortId)) {
      return next();
    }

    // Find the URL and track the visit
    const entry = await URL.findOneAndUpdate(
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
      // If not found, proceed to next middleware/route
      return next();
    }

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
app.use("/test", testRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
