const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || "Mehul-2004@#$%"; // Use environment variable if available

function setUser(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    secret,
    {
      expiresIn: "24h", // Token expires in 24 hours
    }
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

    const decoded = jwt.verify(token, secret);

    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      throw new Error("Token has expired");
    }

    return decoded;
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return null; // Return null instead of throwing an error
  }
}

module.exports = {
  setUser,
  getUser,
};
