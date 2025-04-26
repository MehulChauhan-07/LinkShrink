const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const URL = require("./models/url_Schema");
const { connectToMongoDB } = require("./mongo_config");

const { restrictToLoggedInUsers, checkAuth } = require("./midddelware/auth");
const staticRoute = require("./routes/staticRoute");
const testRouter = require("./routes/test");
const urlRouter = require("./routes/url");
const userRouter = require("./routes/user");

connectToMongoDB("mongodb://localhost:27017/url_shortener");

const app = express();
const port = 3000;

//! middleware for the url router which is store in to log file
// const { logRequest } = require("./midddelware/logfile");
// app.use(logRequest("log.txt"));

// middleware
app.use((req, res, next) => {
  console.log(`${req.method} request to http://localhost:${port}${req.url}`);
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
app.use(checkAuth); // Apply globally before defining routee
app.use("/", staticRoute);
app.use("/url", restrictToLoggedInUsers, urlRouter);
app.use("/user", userRouter);
app.use("/test", testRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
