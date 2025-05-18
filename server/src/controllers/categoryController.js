const Category = require("../models/Category");

// @desc    Create default categories if none exist
// @route   No direct route, used internally
// @access  Private
exports.createDefaultCategoriesIfNoneExist = async () => {
  try {
    const count = await Category.countDocuments();

    // If no categories exist, create defaults
    if (count === 0) {
      const defaultCategories = [
        { name: "Road", description: "Issues related to roads and traffic" },
        {
          name: "Electricity",
          description: "Issues related to electrical supply and infrastructure",
        },
        {
          name: "Water",
          description: "Issues related to water supply and drainage",
        },
        {
          name: "Sanitation",
          description: "Issues related to waste management and cleanliness",
        },
        {
          name: "Public Property",
          description: "Issues related to public buildings and spaces",
        },
        {
          name: "Parks",
          description: "Issues related to parks and recreational areas",
        },
      ];

      await Category.insertMany(defaultCategories);
      console.log("Default categories created successfully");
    }
  } catch (error) {
    console.error("Error creating default categories:", error);
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category not found with id of ${req.params.id}`,
      });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category not found with id of ${req.params.id}`,
      });
    }

    // Instead of actual delete, set status to inactive
    category.status = "inactive";
    await category.save();

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

// Other controller functions...
