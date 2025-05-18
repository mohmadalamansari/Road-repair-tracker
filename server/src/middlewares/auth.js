const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config");

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    // Set token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log("Decoded token:", decoded);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Your account is inactive. Please contact an administrator.",
      });
    }

    console.log("Authenticated user:", { id: user._id, role: user.role });

    // Add user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log("Authorization check:", {
      userRole: req.user.role,
      requiredRoles: roles,
      hasAccess: roles.includes(req.user.role),
      userId: req.user._id.toString(),
      requestedId: req.params.id,
    });

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${
          req.user.role
        } is not authorized to access this route (requires ${roles.join(
          " or "
        )})`,
      });
    }
    next();
  };
};
