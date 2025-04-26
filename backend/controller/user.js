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
      if (req.headers.accept === "application/json") {
        return res.status(400).json({
          success: false,
          error: "Username or email already exists",
        });
      }
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

    // Create token
    const token = setUser(user);

    if (req.headers.accept === "application/json") {
      return res.status(201).json({
        success: true,
        token,
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    }

    // For web requests, set cookie and redirect
    res.cookie("uid", token, { httpOnly: true });
    return res.status(201).redirect("/");
  } catch (error) {
    console.error("Signup Error:", error);
    if (req.headers.accept === "application/json") {
      return res.status(400).json({
        success: false,
        error: "An error occurred during signup. Please try again.",
      });
    }
    return res.status(400).render("signup", {
      error: "An error occurred during signup. Please try again.",
    });
  }
}

async function handleUserlogin(req, res) {
  try {
    console.log("Login Request Body:", req.body);
    console.log("Login Request Headers:", req.headers);

    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      console.log("Missing credentials:", { usernameOrEmail, password });
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

    console.log("Found user:", user ? "Yes" : "No");

    if (!user || user.password !== password) {
      console.log("Invalid credentials");
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
    console.log("Token created successfully");

    if (req.headers.accept === "application/json") {
      console.log("Sending JSON response");
      return res.status(200).json({
        success: true,
        token,
        user: {
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    }

    // For web requests, set cookie and redirect
    res.cookie("uid", token, { httpOnly: true });
    return res.status(200).redirect("/");
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

async function handleVerifyToken(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    // Find user in database to get latest data
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Token Verification Error:", error);
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
}

module.exports = {
  handleUserSignup,
  handleUserlogin,
  handleVerifyToken,
};
