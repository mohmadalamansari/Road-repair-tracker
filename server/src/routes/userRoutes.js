const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getOfficers,
} = require("../controllers/userController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

// Protect all routes
router.use(protect);

// Admin-only routes
router
  .route("/")
  .get(authorize("admin"), getUsers)
  .post(authorize("admin"), createUser);

// Route to get all officers
router.route("/officers").get(authorize("admin"), getOfficers);

// Allow users to get and update their own profile, but restrict deletion to admin
router
  .route("/:id")
  .get((req, res, next) => {
    // Allow users to get their own profile
    if (req.user._id.toString() === req.params.id) {
      return next();
    }
    // For other profiles, only admin can access
    return authorize("admin")(req, res, next);
  }, getUser)
  .put((req, res, next) => {
    // Allow users to update their own profile
    if (req.user._id.toString() === req.params.id) {
      return next();
    }
    // For other profiles, only admin can update
    return authorize("admin")(req, res, next);
  }, updateUser)
  .delete(authorize("admin"), deleteUser);

module.exports = router;
