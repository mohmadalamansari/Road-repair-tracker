const User = require("../models/User");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    // Use provided role or default to citizen
    // Only allow citizen, officer, admin roles
    const userRole = ["citizen", "officer", "admin"].includes(role)
      ? role
      : "citizen";

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
    });

    console.log("Registered user:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is active
    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Your account is inactive. Please contact an administrator.",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    console.log("Getting user data for:", req.user._id);

    const user = await User.findById(req.user._id).populate([
      { path: "department", select: "name" },
      { path: "region", select: "name" },
    ]);

    if (!user) {
      console.log("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User found:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
};

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both current and new password",
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  // Use secure cookies in production
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    data: user,
  });
};
