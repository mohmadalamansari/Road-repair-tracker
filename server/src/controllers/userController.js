const User = require("../models/User");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // Build query with filters
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude from matching
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource
    query = User.find(JSON.parse(queryStr)).populate([
      { path: "department", select: "name" },
      { path: "region", select: "name" },
    ]);

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const users = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get all officers
// @route   GET /api/users/officers
// @access  Private/Admin
exports.getOfficers = async (req, res) => {
  try {
    // Find all users with role 'officer'
    const officers = await User.find({ role: "officer" })
      .populate([
        {
          path: "department",
          select: "name headquarters contactEmail contactPhone",
        },
        { path: "region", select: "name" },
      ])
      .sort("name");

    res.status(200).json({
      success: true,
      count: officers.length,
      data: officers,
    });
  } catch (error) {
    console.error("Error in getOfficers:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate([
      { path: "department", select: "name" },
      { path: "region", select: "name" },
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin or Self
exports.updateUser = async (req, res) => {
  try {
    // Find user
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`,
      });
    }

    // Only allow admins or the user themselves to update their profile
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this user",
      });
    }

    // If role is being changed, only admins can do that
    if (
      req.body.role &&
      req.body.role !== user.role &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to change role",
      });
    }

    // Update user
    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "department", select: "name" },
      { path: "region", select: "name" },
    ]);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`,
      });
    }

    await user.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
