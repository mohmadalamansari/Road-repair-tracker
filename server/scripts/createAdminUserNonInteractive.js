/**
 * Script to create an admin user with command line arguments
 * Usage: node createAdminUserNonInteractive.js <name> <email> <password>
 *
 * Example: node createAdminUserNonInteractive.js "Admin User" admin@example.com password123
 */

const mongoose = require("mongoose");
const path = require("path");

// Import config and models
const config = require("../src/config/index");
const User = require("../src/models/User");
const connectDB = require("../src/config/db");

// Create admin user function
const createAdminUser = async (name, email, password) => {
  try {
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`\nUser with email ${email} already exists.`);

      // If user exists but is not admin, update the role
      if (existingUser.role !== "admin") {
        existingUser.role = "admin";
        await existingUser.save();
        console.log(
          `\nUser ${existingUser.email} has been updated to admin role.`
        );
      } else {
        console.log("This user is already an admin.");
      }
      return;
    }

    // Create new admin user
    const user = await User.create({
      name,
      email,
      password,
      role: "admin",
      status: "active",
    });

    console.log(`\nAdmin user created successfully:`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    console.error(`\nError creating admin user: ${error.message}`);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.length !== 3) {
      console.log(
        "\nUsage: node createAdminUserNonInteractive.js <name> <email> <password>"
      );
      process.exit(1);
    }

    const [name, email, password] = args;

    // Validate inputs
    if (!name || !email || !password) {
      console.log(
        "\nError: All parameters (name, email, password) are required"
      );
      process.exit(1);
    }

    if (password.length < 6) {
      console.log("\nError: Password must be at least 6 characters long");
      process.exit(1);
    }

    // Connect to MongoDB
    await connectDB();
    console.log(`\nRunning admin user creation...`);

    // Create admin user
    await createAdminUser(name, email, password);

    // Disconnect from database
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
