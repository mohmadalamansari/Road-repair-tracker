const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const path = require("path");

// Import config and models - use the actual paths used in the project
const config = require("../src/config/index");
const User = require("../src/models/User");
const connectDB = require("../src/config/db");

// Create interface for command line input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt for user input
const promptUserInput = () => {
  return new Promise((resolve) => {
    rl.question("Enter admin name: ", (name) => {
      rl.question("Enter admin email: ", (email) => {
        rl.question(
          "Enter admin password (min 6 characters): ",
          async (password) => {
            resolve({ name, email, password });
          }
        );
      });
    });
  });
};

// Create admin user
const createAdminUser = async (userData) => {
  try {
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      console.log(`\nUser with email ${userData.email} already exists.`);

      // If user exists but is not admin, we can update the role
      if (existingUser.role !== "admin") {
        const shouldUpdate = await promptYesNo(
          `Would you like to update this user to admin role? (y/n): `
        );

        if (shouldUpdate) {
          existingUser.role = "admin";
          await existingUser.save();
          console.log(
            `\nUser ${existingUser.email} has been updated to admin role.`
          );
        }
      } else {
        console.log("This user is already an admin.");
      }
    } else {
      // Create new admin user
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: "admin",
        status: "active",
      });

      console.log(`\nAdmin user created successfully:`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
    }
  } catch (error) {
    console.error(`\nError creating admin user: ${error.message}`);
  }
};

// Helper function to prompt yes/no questions
const promptYesNo = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
};

// Main function
const main = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log("\n=== Create Admin User ===\n");

    const userData = await promptUserInput();

    if (userData.password.length < 6) {
      console.log("\nPassword must be at least 6 characters long.");
      rl.close();
      await mongoose.disconnect();
      process.exit(1);
    }

    await createAdminUser(userData);

    rl.close();
    await mongoose.disconnect();
    console.log("\nDisconnected from database");
    process.exit(0);
  } catch (error) {
    console.error(`\nAn error occurred: ${error.message}`);
    process.exit(1);
  }
};

// Run the script
main();
