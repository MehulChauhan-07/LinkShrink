const User = require("../models/users_Schema");
// const { v4: uuidv4 } = require("uuid");
const { setUser } = require("../services/auth_uid");

async function handleUserSignup(req, res) {
  try {
    const { username, name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).render("signup", {
        error: "Username or email already exists",
      });
    }

    // Create new user
    const user = await User.create({
      username,
      name,
      email,
      password, // Note: In production, hash the password
    });

    // Create token and set cookie
    const token = setUser(user);
    res.cookie("uid", token, { httpOnly: true });

    return res.status(201).redirect("/");
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(400).render("signup", {
      error: "An error occurred during signup. Please try again.",
    });
  }
}

async function handleUserlogin(req, res) {
  try {
    console.log("Login Request Body:", req.body); // Debug log

    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      if (req.headers.accept === "application/json") {
        return res.status(400).json({
          success: false,
          error: "Username/Email and password are required",
        });
      }
      return res.status(400).render("login", {
        error: "Username/Email and password are required",
      });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail.toLowerCase() },
        { username: usernameOrEmail },
      ],
    });

    if (!user || user.password !== password) {
      // Note: In production, use proper password comparison
      if (req.headers.accept === "application/json") {
        return res.status(400).json({
          success: false,
          error: "Invalid credentials. Please try again.",
        });
      }
      return res.status(400).render("login", {
        error: "Invalid credentials. Please try again.",
      });
    }

    // Create token
    const token = setUser(user);

    // Check if it's an API request
    if (req.headers.accept === "application/json") {
      // For API requests, return the token in the response
      return res.status(200).json({
        success: true,
        token,
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      // For web requests, set cookie and redirect
      res.cookie("uid", token, { httpOnly: true });
      return res.status(200).redirect("/");
    }
  } catch (error) {
    console.error("Login Error:", error);
    if (req.headers.accept === "application/json") {
      return res.status(400).json({
        success: false,
        error: "An error occurred. Please try again.",
      });
    }
    return res.status(400).render("login", {
      error: "An error occurred. Please try again.",
    });
  }
}

module.exports = {
  handleUserSignup,
  handleUserlogin,
};
