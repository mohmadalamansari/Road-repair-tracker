const Report = require("../models/Report");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");
const Department = require("../models/Department");
const Region = require("../models/Region");

// @desc    Get all reports
// @route   GET /api/reports
// @access  Public for some, Private for detailed view
exports.getReports = async (req, res) => {
  try {
    // Build query with filters
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude from matching
    const removeFields = [
      "select",
      "sort",
      "page",
      "limit",
      "radius",
      "lat",
      "lng",
    ];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource
    query = Report.find(JSON.parse(queryStr)).populate([
      { path: "citizen", select: "name" },
      { path: "assignedOfficer", select: "name" },
      { path: "department", select: "name" },
      { path: "region", select: "name" },
    ]);

    // If lat/lng and radius are provided, find reports within a radius
    if (req.query.lat && req.query.lng && req.query.radius) {
      const { lat, lng, radius } = req.query;

      // Calculate distance using Haversine formula
      query = Report.find({
        "location.coordinates": {
          $geoWithin: {
            $centerSphere: [
              [parseFloat(lng), parseFloat(lat)],
              parseFloat(radius) / 3963.2,
            ],
          },
        },
      }).populate([
        { path: "citizen", select: "name" },
        { path: "assignedOfficer", select: "name" },
        { path: "department", select: "name" },
        { path: "region", select: "name" },
      ]);
    }

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
    const total = await Report.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const reports = await query;

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
      count: reports.length,
      pagination,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Public
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate([
      { path: "citizen", select: "name email" },
      { path: "assignedOfficer", select: "name email department" },
      { path: "department", select: "name" },
      { path: "region", select: "name" },
    ]);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Create report
// @route   POST /api/reports
// @access  Private/Citizen
exports.createReport = async (req, res) => {
  try {
    // Add user to req.body
    req.body.citizen = req.user.id;

    // Handle location data
    if (req.body.location) {
      // If location comes as strings (from FormData), parse them
      if (typeof req.body.location === "string") {
        req.body.location = JSON.parse(req.body.location);
      }
    } else if (
      req.body["location[lat]"] &&
      req.body["location[lng]"] &&
      req.body["location[address]"]
    ) {
      // If location is sent as separate form fields
      req.body.location = {
        address: req.body["location[address]"],
        coordinates: {
          lat: parseFloat(req.body["location[lat]"]),
          lng: parseFloat(req.body["location[lng]"]),
        },
      };

      // Remove the separate fields
      delete req.body["location[lat]"];
      delete req.body["location[lng]"];
      delete req.body["location[address]"];
    }

    // Create the report
    const report = await Report.create(req.body);

    // Handle file uploads
    if (req.files && Object.keys(req.files).length > 0) {
      const uploadedPhotos = [];

      // Handle single or multiple files
      let imagesToProcess = [];
      if (req.files.images) {
        // If multiple files, make sure it's an array
        imagesToProcess = Array.isArray(req.files.images)
          ? req.files.images
          : [req.files.images];
      } else if (req.files.file) {
        // If using 'file' as the key
        imagesToProcess = Array.isArray(req.files.file)
          ? req.files.file
          : [req.files.file];
      }

      // Process each image
      for (const file of imagesToProcess) {
        // Validate file is an image
        if (!file.mimetype.startsWith("image")) {
          continue; // Skip non-image files
        }

        // Create custom filename
        const fileName = `photo_${report._id}_${Date.now()}${
          path.parse(file.name).ext
        }`;
        const uploadPath = `${
          process.env.FILE_UPLOAD_PATH || "./public/uploads"
        }/${fileName}`;

        // Move file
        await file.mv(uploadPath);

        // Add to list of uploaded photos
        uploadedPhotos.push(`/uploads/${fileName}`);
      }

      // Add photos to report if any were successfully uploaded
      if (uploadedPhotos.length > 0) {
        report.photos = uploadedPhotos;
        await report.save();
      }
    }

    // Add initial update to track progress
    report.updates.push({
      message: "Report submitted by citizen",
      status: "Pending",
      updatedBy: req.user.id,
    });

    await report.save();

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Report creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private
exports.updateReport = async (req, res) => {
  try {
    let report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`,
      });
    }

    // Make sure user is citizen who created the report or officer/admin
    if (
      report.citizen.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "officer"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this report",
      });
    }

    // Add update to history if status is changed or update message is provided
    if (req.body.status && req.body.status !== report.status) {
      report.updates.push({
        message:
          req.body.updateMessage || `Status changed to ${req.body.status}`,
        status: req.body.status,
        updatedBy: req.user.id,
      });

      // If status is Resolved, set resolvedAt timestamp
      if (req.body.status === "Resolved") {
        req.body.resolvedAt = Date.now();
      }
    }

    report = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "citizen", select: "name email" },
      { path: "assignedOfficer", select: "name email department" },
      { path: "department", select: "name" },
      { path: "region", select: "name" },
    ]);

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`,
      });
    }

    // Make sure user is citizen who created the report or admin
    if (
      report.citizen.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this report",
      });
    }

    await report.remove();

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

// @desc    Add report update
// @route   POST /api/reports/:id/updates
// @access  Private
exports.addReportUpdate = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`,
      });
    }

    // Only officer assigned to the report, admin, or the citizen who created it can add updates
    if (
      req.user.role !== "admin" &&
      req.user.role === "officer" &&
      report.assignedOfficer?.toString() !== req.user.id &&
      req.user.role === "citizen" &&
      report.citizen.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this report",
      });
    }

    // Add update
    report.updates.push({
      message: req.body.message,
      status: req.body.status || report.status,
      updatedBy: req.user.id,
    });

    // Update status if provided
    if (req.body.status) {
      report.status = req.body.status;

      // If status is Resolved, set resolvedAt timestamp
      if (req.body.status === "Resolved") {
        report.resolvedAt = Date.now();
      }
    }

    await report.save();

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Add feedback to report
// @route   POST /api/reports/:id/feedback
// @access  Private/Citizen
exports.addReportFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a rating between 1 and 5",
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`,
      });
    }

    // Only citizen who created the report can add feedback
    if (report.citizen.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to add feedback to this report",
      });
    }

    // Only allow feedback on resolved reports
    if (report.status !== "Resolved") {
      return res.status(400).json({
        success: false,
        message: "Can only add feedback to resolved reports",
      });
    }

    // Add feedback
    report.feedback = {
      rating,
      comment,
      submittedAt: Date.now(),
    };

    await report.save();

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Upload report photos
// @route   PUT /api/reports/:id/photo
// @access  Private
exports.reportPhotoUpload = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`,
      });
    }

    // Make sure user is citizen who created the report or admin/officer
    if (
      report.citizen.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "officer"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to upload photos to this report",
      });
    }

    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith("image")) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file",
      });
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD || file.size > 1000000) {
      return res.status(400).json({
        success: false,
        message: `Please upload an image less than ${
          process.env.MAX_FILE_UPLOAD || "1MB"
        }`,
      });
    }

    // Create custom filename
    file.name = `photo_${report._id}_${Date.now()}${path.parse(file.name).ext}`;

    // Move file to upload path
    file.mv(
      `${process.env.FILE_UPLOAD_PATH || "./public/uploads"}/${file.name}`,
      async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "Problem with file upload",
          });
        }

        // Add photo URL to report
        report.photos.push(`/uploads/${file.name}`);
        await report.save();

        res.status(200).json({
          success: true,
          data: report,
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get report analytics
// @route   GET /api/reports/analytics
// @access  Private/Admin
exports.getReportAnalytics = async (req, res) => {
  try {
    // Get total reports
    const totalReports = await Report.countDocuments();

    // Get resolved reports
    const resolvedReports = await Report.countDocuments({ status: "Resolved" });

    // Get pending reports
    const pendingReports = await Report.countDocuments({ status: "Pending" });

    // Get average resolution time
    const resolvedReportsData = await Report.find({
      status: "Resolved",
      resolvedAt: { $exists: true },
    }).select("createdAt resolvedAt");

    let avgResolutionTime = 0;
    if (resolvedReportsData.length > 0) {
      const totalTime = resolvedReportsData.reduce((sum, report) => {
        const resolutionTime = report.resolvedAt - report.createdAt;
        return sum + resolutionTime;
      }, 0);

      // Calculate average in days
      avgResolutionTime =
        totalTime / resolvedReportsData.length / (1000 * 60 * 60 * 24);
      avgResolutionTime = parseFloat(avgResolutionTime.toFixed(1));
    }

    // Get reports by category
    const reportsByCategoryData = await Report.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
    ]);

    // Get reports by region
    const reportsByRegionData = await Report.aggregate([
      { $group: { _id: "$region", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "regions",
          localField: "_id",
          foreignField: "_id",
          as: "region",
        },
      },
      { $unwind: "$region" },
      { $project: { _id: 0, name: "$region.name", count: 1 } },
      { $sort: { count: -1 } },
    ]);

    // Get reports by severity
    const reportsBySeverityData = await Report.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
    ]);

    // Get monthly trends data for the current year
    const currentYear = new Date().getFullYear();
    const monthlyTrendsData = await Report.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          reports: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          reports: 1,
          resolved: 1,
        },
      },
    ]);

    // Format months for output
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedMonthlyData = months.map((month, index) => {
      const monthData = monthlyTrendsData.find(
        (item) => item.month === index + 1
      );
      return {
        month,
        reports: monthData ? monthData.reports : 0,
        resolved: monthData ? monthData.resolved : 0,
      };
    });

    // Get department performance data
    const performanceData = await Report.aggregate([
      { $match: { status: "Resolved", resolvedAt: { $exists: true } } },
      {
        $group: {
          _id: "$department",
          reportsResolved: { $sum: 1 },
          avgTime: {
            $avg: {
              $divide: [
                { $subtract: ["$resolvedAt", "$createdAt"] },
                1000 * 60 * 60 * 24, // convert ms to days
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: "$department" },
      {
        $project: {
          _id: 0,
          department: "$department.name",
          reportsResolved: 1,
          avgTime: { $round: ["$avgTime", 1] },
        },
      },
    ]);

    // Add satisfaction data (derived from feedback)
    const feedbackData = await Report.aggregate([
      { $match: { "feedback.rating": { $exists: true } } },
      {
        $group: {
          _id: "$department",
          totalRating: { $sum: "$feedback.rating" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: "$department" },
      {
        $project: {
          _id: 0,
          department: "$department.name",
          satisfaction: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$totalRating", { $multiply: ["$count", 5] }] },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
    ]);

    // Merge performance and feedback data
    const mergedPerformanceData = performanceData.map((perfItem) => {
      const feedbackItem = feedbackData.find(
        (item) => item.department === perfItem.department
      );
      return {
        ...perfItem,
        satisfaction: feedbackItem ? feedbackItem.satisfaction : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        resolvedReports,
        pendingReports,
        avgResolutionTime,
        reportsByCategoryData,
        reportsByRegionData,
        reportsBySeverityData,
        monthlyTrendsData: formattedMonthlyData,
        performanceData: mergedPerformanceData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Cancel report
// @route   PATCH /api/reports/:id/cancel
// @access  Private/Citizen
exports.cancelReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`,
      });
    }

    // Make sure user is the citizen who created the report
    if (report.citizen.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to cancel this report",
      });
    }

    // Check if the report can be cancelled (only if it's in Pending status)
    if (report.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only reports with 'Pending' status can be cancelled",
      });
    }

    // Update status to Cancelled
    report.status = "Cancelled";

    // Add update to history
    report.updates.push({
      message: "Report cancelled by citizen",
      status: "Cancelled",
      updatedBy: req.user.id,
    });

    await report.save();

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get reports for the current user
// @route   GET /api/reports/user
// @access  Private/Citizen
exports.getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ citizen: req.user.id })
      .sort("-createdAt")
      .populate([
        { path: "assignedOfficer", select: "name" },
        { path: "department", select: "name" },
        { path: "region", select: "name" },
      ]);

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get report timeline updates
// @route   GET /api/reports/:id/timeline
// @access  Private
exports.getReportTimeline = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`,
      });
    }

    // Get the updates from the report and populate the updatedBy field
    const timeline = await Report.findById(req.params.id)
      .select("updates")
      .populate({
        path: "updates.updatedBy",
        select: "name role",
      });

    // If no updates, return empty array
    if (!timeline || !timeline.updates) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Format updates for response
    const formattedUpdates = timeline.updates.map((update) => ({
      status: update.status,
      message: update.message,
      updatedBy: update.updatedBy,
      createdAt: update.timestamp,
    }));

    res.status(200).json({
      success: true,
      data: formattedUpdates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @route   GET /api/reports/dashboard-stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total reports count and by status
    const [
      totalReports,
      resolvedReports,
      pendingReports,
      inProgressReports,
      cancelledReports,
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: "Resolved" }),
      Report.countDocuments({ status: "Pending" }),
      Report.countDocuments({ status: "In Progress" }),
      Report.countDocuments({ status: "Cancelled" }),
    ]);

    // Calculate response rate
    const responseRate =
      totalReports > 0
        ? Math.round(
            ((resolvedReports + inProgressReports) / totalReports) * 100
          )
        : 0;

    // Get users data - get more detailed stats
    const users = await User.find()
      .select("_id name email role status department region createdAt")
      .populate("department region")
      .sort("-createdAt");

    // Calculate user statistics
    const activeUsers = users.filter((u) => u.status === "active").length;
    const adminCount = users.filter((u) => u.role === "admin").length;
    const officerCount = users.filter((u) => u.role === "officer").length;
    const citizenCount = users.filter((u) => u.role === "citizen").length;
    const recentJoined = users.filter((u) => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(u.createdAt) >= oneMonthAgo;
    }).length;

    // Get recent users (limit to 5)
    const recentUsers = users.slice(0, 5).map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department ? user.department.name : null,
      region: user.region ? user.region.name : null,
      dateJoined: new Date(user.createdAt).toLocaleDateString(),
      status: user.status,
    }));

    // Get department performance data
    const departments = await Department.find();
    const processedDepartments = await Promise.all(
      departments.map(async (dept) => {
        const deptReports = await Report.countDocuments({
          department: dept._id,
        });
        const deptCompleted = await Report.countDocuments({
          department: dept._id,
          status: "Resolved",
        });
        const deptInProgress = await Report.countDocuments({
          department: dept._id,
          status: "In Progress",
        });

        // Count officers in this department
        const officersInDept = await User.countDocuments({
          department: dept._id,
          role: "officer",
          status: "active",
        });

        const completionRate =
          deptReports > 0 ? Math.round((deptCompleted / deptReports) * 100) : 0;

        return {
          _id: dept._id,
          name: dept.name,
          assigned: deptReports,
          inProgress: deptInProgress,
          completed: deptCompleted,
          completionRate,
          officerCount: officersInDept,
          color: "bg-amber-100 text-amber-800", // Default color
        };
      })
    );

    // Get region data
    const regions = await Region.find();
    const processedRegions = await Promise.all(
      regions.map(async (region, index) => {
        const colors = [
          "bg-blue-500",
          "bg-green-500",
          "bg-purple-500",
          "bg-amber-500",
          "bg-cyan-500",
        ];

        const regionReports = await Report.countDocuments({
          region: region._id,
        });

        // Count citizens in this region
        const citizensInRegion = await User.countDocuments({
          region: region._id,
          role: "citizen",
          status: "active",
        });

        return {
          _id: region._id,
          name: region.name,
          count: regionReports,
          citizenCount: citizensInRegion,
          color: colors[index % colors.length],
        };
      })
    );

    // Format stats data
    const stats = [
      {
        title: "Total Reports",
        value: totalReports,
        change: "",
        changeType: "neutral",
        color: "from-purple-400 to-purple-600",
      },
      {
        title: "Active Users",
        value: activeUsers,
        change: `+${recentJoined} this month`,
        changeType: "increase",
        color: "from-blue-400 to-blue-600",
      },
      {
        title: "Completed Issues",
        value: resolvedReports,
        change: `${Math.round(
          (resolvedReports / Math.max(totalReports, 1)) * 100
        )}%`,
        changeType: "neutral",
        color: "from-green-400 to-green-600",
      },
      {
        title: "Response Rate",
        value: `${responseRate}%`,
        change: "",
        changeType: "neutral",
        color: "from-teal-400 to-teal-600",
      },
    ];

    // User statistics for display
    const userStats = {
      total: users.length,
      active: activeUsers,
      inactive: users.length - activeUsers,
      admins: adminCount,
      officers: officerCount,
      citizens: citizenCount,
      recentJoined,
    };

    // Return all dashboard data
    return res.status(200).json({
      success: true,
      data: {
        stats,
        userStats,
        departments: processedDepartments,
        regions: processedRegions,
        recentUsers,
      },
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard statistics",
    });
  }
};

// @desc    Get reports assigned to current officer
// @route   GET /api/reports/assigned
// @access  Private/Officer
exports.getAssignedReports = async (req, res) => {
  try {
    // Get all reports assigned to the logged-in officer
    const reports = await Report.find({ assignedOfficer: req.user.id })
      .sort("-createdAt")
      .populate([
        { path: "citizen", select: "name" },
        { path: "department", select: "name" },
        { path: "region", select: "name" },
      ]);

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Error in getAssignedReports:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Acknowledge report resolution
// @route   PATCH /api/reports/:id/acknowledge
// @access  Private/Citizen
exports.acknowledgeResolution = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`,
      });
    }

    // Make sure user is the citizen who created the report
    if (report.citizen.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to acknowledge this report",
      });
    }

    // Check if the report can be acknowledged (only if it's in Resolved status)
    if (report.status !== "Resolved") {
      return res.status(400).json({
        success: false,
        message: "Only reports with 'Resolved' status can be acknowledged",
      });
    }

    // Update status to Closed
    report.status = "Closed";
    report.closedAt = Date.now();

    // Add update to history
    report.updates.push({
      message: "Resolution acknowledged by citizen. Report closed.",
      status: "Closed",
      updatedBy: req.user.id,
    });

    await report.save();

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Close report directly by citizen
// @route   PATCH /api/reports/:id/close
// @access  Private/Citizen
exports.closeReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`,
      });
    }

    // Make sure user is the citizen who created the report
    if (report.citizen.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to close this report",
      });
    }

    // Check if the report can be closed (not already closed or cancelled)
    if (["Closed", "Cancelled"].includes(report.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot close a report that is already ${report.status.toLowerCase()}`,
      });
    }

    // Update status to Closed
    report.status = "Closed";
    report.closedAt = Date.now();

    // Add update to history
    report.updates.push({
      message: "Report closed by citizen",
      status: "Closed",
      updatedBy: req.user.id,
    });

    await report.save();

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
