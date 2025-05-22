const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || "mongodb+srv://alamrehan12345678:alamrehan12345678@cluster0.6j0sjn2.mongodb.net/civicpulse?retryWrites=true&w=majority&appName=Cluster0",
  jwtSecret: process.env.JWT_SECRET || "civicpulse_jwt_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};
