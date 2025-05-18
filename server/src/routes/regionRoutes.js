const express = require("express");
const {
  getRegions,
  getRegion,
  createRegion,
  updateRegion,
  deleteRegion,
  getRegionStats,
} = require("../controllers/regionController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.get("/", getRegions);
router.get("/:id", getRegion);

// Protected routes
router.get(
  "/stats/all",
  protect,
  authorize("admin", "officer"),
  getRegionStats
);

// Admin only routes
router.post("/", protect, authorize("admin"), createRegion);
router.put("/:id", protect, authorize("admin"), updateRegion);
router.delete("/:id", protect, authorize("admin"), deleteRegion);

module.exports = router;
