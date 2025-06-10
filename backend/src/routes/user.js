const express = require("express");
const { body } = require("express-validator");

const {
  handleUserSignup,
  handleUserlogin,
  handleVerifyToken,
} = require("../controller/user");
const router = express.Router();

router.post(
  "/signup",
  [
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("email").isEmail().withMessage("Please provide a valid email address"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  handleUserSignup
);
router.post("/login", handleUserlogin);
router.get("/verify", handleVerifyToken);
router.post("/logout", (req, res) => {
  res.clearCookie("uid");
  return res.redirect("/login");
});

module.exports = router;
