const User = require("../models/users_Schema");
// const { v4: uuidv4 } = require("uuid");
const { setUser } = require("../services/auth_uid");

async function handleUserSignup(req, res) {
  try {
    const { name, email, password } = req.body;
    await User.create({ name, email, password });
    return res.status(201).render("home");
  } catch (error) {
    res.status(400).send(error);
  }
}

async function handleUserlogin(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    console.log("User:", user);

    if (!user) {
      // Render the login page with an error message
      return res.status(400).render("login", {
        error: "Invalid email or password. Please try again.",
      });
    }

    // Create a token
    const token = setUser(user);
    console.log("Generated Token:", token); // Log the generated token
    res.cookie("uid", token, { httpOnly: true });
    return res.status(200).redirect("/");
  } catch (error) {
    console.error("Login Error:", error.message); // Log the error message
    res.status(400).render("login", {
      error: "An error occurred. Please try again.",
    });
  }
}

module.exports = {
  handleUserSignup,
  handleUserlogin,
};
