const express = require("express");
const URL = require("../models/url_Schema");
const { restrictTo } = require("../midddelware/auth");

const router = express.Router();

router.get("/admin/urls", restrictTo(["ADMIN"]), async (req, res) => {
  if (!req.user) {
    return res.render("login", {
      error: "Please log in to access this page.",
    });
  }
  const isAdmin = req.user.role === "ADMIN";

  let allurls = await URL.find({}).populate("createdBy", "emails");
  return res.render("home", { urls: allurls, isAdmin });
});

router.get("/", restrictTo(["NORMAL", "ADMIN"]), async (req, res) => {
  if (!req.user) {
    return res.render("login", {
      error: "Please log in to access this page.",
    });
  }
  let allurls;

  const isAdmin = req.user.role === "ADMIN";
  if (isAdmin) {
    allurls = await URL.find({}).populate("createdBy", "email");
  } else {
    allurls = await URL.find({ createdBy: req.user._id });
  }
  return res.render("home", { urls: allurls, isAdmin });
});

router.get("/signup", (req, res) => {
  res.render("signup");
});
router.get("/login", (req, res) => {
  res.render("login");
});
module.exports = router;
