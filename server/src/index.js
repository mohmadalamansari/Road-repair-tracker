const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload");

// Load config
const config = require("./config");
const connectDB = require("./config/db");

// Connect to database
connectDB();

// Load route files
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const regionRoutes = require("./routes/regionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Load error middleware
const errorHandler = require("./middlewares/error");

// Import category and region controllers for default data creation
const {
  createDefaultCategoriesIfNoneExist,
} = require("./controllers/categoryController");
const {
  createDefaultRegionsIfNoneExist,
} = require("./controllers/regionController");

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = process.env.FILE_UPLOAD_PATH || "./public/uploads";
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("Upload directory created:", uploadsDir);
  } else {
    console.log("Upload directory already exists:", uploadsDir);
  }
} catch (err) {
  console.error("Failed to create upload directory:", err.message);
  process.exit(1); // Exit process if critical
}

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(
  cors()
);

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File uploading
app.use(fileUpload());

// Set static folder
app.use(express.static(path.join(__dirname, "../public")));

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reports", reportRoutes);

// Create default categories and regions on server start
const createDefaultData = async () => {
  await createDefaultCategoriesIfNoneExist();
  await createDefaultRegionsIfNoneExist();
};

// Base route
app.get("/", (req, res) => {
  res.send("CivicPulse API is running");
});

// Error handler middleware
app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Create default data after server starts
  try {
    await createDefaultData();
  } catch (error) {
    console.error("Error creating default data:", error);
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports=app