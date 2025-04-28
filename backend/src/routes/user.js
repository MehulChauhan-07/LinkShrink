const express = require("express");
const {
  handleUserSignup,
  handleUserlogin,
  handleVerifyToken,
} = require("../controller/user");
const router = express.Router();

router.post("/signup", handleUserSignup);
router.post("/login", handleUserlogin);
router.get("/verify", handleVerifyToken);
router.post("/logout", (req, res) => {
  res.clearCookie("uid");
  return res.redirect("/login");
});

module.exports = router;
