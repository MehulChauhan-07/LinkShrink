import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Validate critical environment variables
const validateEnv = ()=> {
  if (!process.env.JWT_SECRET && env.NODE_ENV === "production") {
    console.error(
      "⚠️  WARNING: JWT_SECRET is not set in production environment"
    );
  }
  if (!process.env.JWT_EXPIRES_IN) {
    console.warn(
      "⚠️  WARNING: JWT_EXPIRES_IN is not set, using default value '30d'"
    );
  }

  if (!process.env.MONGODB_URI) {
    console.warn(
      "⚠️  WARNING: MONGODB_URI is not set, using default localhost connection"
    );
  }
};

// Run validation
validateEnv();

module.exports = { env };
