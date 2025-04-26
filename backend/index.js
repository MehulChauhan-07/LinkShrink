require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

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
// const port = 3000;

//! middleware for the url router which is store in to log file
// const { logRequest } = require("./midddelware/logfile");
// app.use(logRequest("log.txt"));

// middleware
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  console.log(`${req.method} request to ${baseUrl}${req.url}`);
  console.log("Request Headers:", req.headers); // Log request headers
  next();
});
app.use(express.json()).use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware to handle favicon.ico requests
app.get("/favicon.ico", (req, res) => res.status(204).end());

// view engine setup
// ! now we use view engine to render the html file which is ejs
app.set("view engine", "ejs").set("views", path.resolve("./views"));

//routes
app.use(checkForAuthorization); // Apply globally before defining routee
app.use("/", staticRoute);
app.use("/url", restrictTo(["NORMAL", "ADMIN"]), urlRouter);
app.use("/user", userRouter);
app.use("/test", testRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.BASE_URL}`);
});
