const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/civicpulse",
  jwtSecret: process.env.JWT_SECRET || "civicpulse_jwt_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};
