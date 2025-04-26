const express = require("express");
const { handleUserSignup, handleUserlogin } = require("../controller/user");
const router = express.Router();

router.post("/signup", handleUserSignup);
router.post("/login", handleUserlogin);
router.post("/logout", (req, res) => {
  res.clearCookie("uid");
  return res.redirect("/login");
});

module.exports = router;
