const express = require("express");
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

// Get all categories - public
router.get("/", getCategories);

// Get single category - public
router.get("/:id", getCategory);

// Create category - admin only
router.post("/", protect, authorize("admin"), createCategory);

// Update category - admin only
router.put("/:id", protect, authorize("admin"), updateCategory);

// Delete category - admin only
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
