const dotenv = require("dotenv");
dotenv.config();

const config = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRES_IN,
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  mongoURI: process.env.MONGODB_URI,
  frontendUrl: process.env.FRONTEND_URL,
};

module.exports = config;