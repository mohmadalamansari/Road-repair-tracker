const express = require("express");
const {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  addReportUpdate,
  addReportFeedback,
  reportPhotoUpload,
  getReportAnalytics,
  cancelReport,
  getUserReports,
  getReportTimeline,
  getDashboardStats,
  getAssignedReports,
  acknowledgeResolution,
  closeReport,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

// Get report analytics - admin only
router.get("/analytics", protect, authorize("admin"), getReportAnalytics);

// Get dashboard statistics - admin only
router.get("/dashboard-stats", protect, authorize("admin"), getDashboardStats);

// Get reports for current user - logged in users only
router.get("/user", protect, getUserReports);

// Get reports assigned to current officer - officer only
router.get("/assigned", protect, authorize("officer"), getAssignedReports);

// Get all reports - public
router.get("/", getReports);

// Get single report - public
router.get("/:id", getReport);

// Create report - logged in citizens
router.post(
  "/",
  protect,
  async (req, res, next) => {
    // Debug middleware to check user role before authorization
    console.log("Creating report with user:", {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
    });

    if (req.user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: `Only citizens can create reports (current role: ${req.user.role})`,
      });
    }

    next();
  },
  createReport
);

// Update report - mixed auth
router.put("/:id", protect, updateReport);

// Delete report - citizen who created it or admin
router.delete("/:id", protect, deleteReport);

// Add report update - mixed auth
router.post("/:id/updates", protect, addReportUpdate);

// Add feedback - citizen only
router.post("/:id/feedback", protect, authorize("citizen"), addReportFeedback);

// Upload photos - mixed auth
router.put("/:id/photo", protect, reportPhotoUpload);

// Get report timeline - mixed auth
router.get("/:id/timeline", protect, getReportTimeline);

// Cancel report - citizen only
router.patch("/:id/cancel", protect, authorize("citizen"), cancelReport);

// Acknowledge report resolution - citizen only
router.patch(
  "/:id/acknowledge",
  protect,
  authorize("citizen"),
  acknowledgeResolution
);

// Close report directly - citizen only
router.patch("/:id/close", protect, authorize("citizen"), closeReport);

module.exports = router;
