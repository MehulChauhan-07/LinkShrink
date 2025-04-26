const jwt = require("jsonwebtoken");
const secret = "Mehul-2004@#$%";

function setUser(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    secret
  );
}

function getUser(token) {
  try {
    if (!token) {
      throw new Error("No token provided");
    }

    // console.log("Received token:", token); // Debugging log

    // Ensure token is in correct JWT format (header.payload.signature)
    if (token.split(".").length !== 3) {
      throw new Error("Invalid JWT format");
    }

    return jwt.verify(token, secret);
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return null; // Return null instead of throwing an error
  }
}

module.exports = {
  setUser,
  getUser,
};
