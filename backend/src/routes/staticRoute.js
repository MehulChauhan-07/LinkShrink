const express = require("express");
const URL = require("../models/url_Schema");
const { restrictTo } = require("../middleware/auth");

const router = express.Router();

// router.get("/admin/urls", restrictTo(["ADMIN"]), async (req, res) => {
router.get("/dashboard", restrictTo(["NORMAL", "ADMIN"]), async (req, res) => {
  if (!req.user) {
    return res.render("login", {
      error: "Please log in to access this page.",
    });
  }

  const isAdmin = req.user.role === "ADMIN";
  let urls;

  if (isAdmin) {
    urls = await URL.find({}).populate("createdBy", "username email");
  } else {
    urls = await URL.find({ createdBy: req.user._id });
  }

  return res.render("dashboard", {
    urls,
    user: req.user,
    isAdmin,
    baseUrl: req.protocol + "://" + req.get("host"),
  });
});

// Home route
router.get("/", restrictTo(["NORMAL", "ADMIN"]), async (req, res) => {
  if (!req.user) {
    return res.render("login", {
      error: "Please log in to access this page.",
    });
  }

  const isAdmin = req.user.role === "ADMIN";
  let urls;

  if (isAdmin) {
    urls = await URL.find({}).populate("createdBy", "username email");
  } else {
    urls = await URL.find({ createdBy: req.user._id });
  }

  return res.json({
    urls,
    user: req.user,
    isAdmin,
    baseUrl: req.protocol + "://" + req.get("host"),
  });
  // return res.render("home", {
  //   urls,
  //   user: req.user,
  //   isAdmin,
  //   baseUrl: req.protocol + "://" + req.get("host"),
  // });
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/login", (req, res) => {
  res.render("login");
});

module.exports = router;
