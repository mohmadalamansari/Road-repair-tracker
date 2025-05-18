const express = require("express");
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
} = require("../controllers/departmentController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.get("/", getDepartments);
router.get("/:id", getDepartment);

// Protected routes
router.get(
  "/stats/all",
  protect,
  authorize("admin", "officer"),
  getDepartmentStats
);

// Admin only routes
router.post("/", protect, authorize("admin"), createDepartment);
router.put("/:id", protect, authorize("admin"), updateDepartment);
router.delete("/:id", protect, authorize("admin"), deleteDepartment);

module.exports = router;
