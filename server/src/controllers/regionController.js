const Region = require("../models/Region");
const User = require("../models/User");
const Report = require("../models/Report");

// @desc    Create default regions if none exist
// @route   No direct route, used internally
// @access  Private
exports.createDefaultRegionsIfNoneExist = async () => {
  try {
    const count = await Region.countDocuments();

    // If no regions exist, create defaults
    if (count === 0) {
      const defaultRegions = [
        {
          name: "Zone A",
          type: "Urban",
          population: 125000,
          area: 24.5,
          coordinates: {
            lat: 37.7749,
            lng: -122.4194,
          },
          status: "active",
        },
        {
          name: "Zone B",
          type: "Suburban",
          population: 85000,
          area: 32.7,
          coordinates: {
            lat: 37.7833,
            lng: -122.4167,
          },
          status: "active",
        },
        {
          name: "Zone C",
          type: "Rural",
          population: 35000,
          area: 78.3,
          coordinates: {
            lat: 37.8044,
            lng: -122.2711,
          },
          status: "active",
        },
      ];

      await Region.insertMany(defaultRegions);
      console.log("Default regions created successfully");
    }
  } catch (error) {
    console.error("Error creating default regions:", error);
  }
};

// @desc    Get all regions
// @route   GET /api/regions
// @access  Public
exports.getRegions = async (req, res) => {
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
    query = Region.find(JSON.parse(queryStr));

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
      query = query.sort("name");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Region.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const regions = await query;

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
      count: regions.length,
      pagination,
      data: regions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get single region
// @route   GET /api/regions/:id
// @access  Public
exports.getRegion = async (req, res) => {
  try {
    const region = await Region.findById(req.params.id);

    if (!region) {
      return res.status(404).json({
        success: false,
        message: `Region not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: region,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Create region
// @route   POST /api/regions
// @access  Private/Admin
exports.createRegion = async (req, res) => {
  try {
    const region = await Region.create(req.body);

    res.status(201).json({
      success: true,
      data: region,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Update region
// @route   PUT /api/regions/:id
// @access  Private/Admin
exports.updateRegion = async (req, res) => {
  try {
    let region = await Region.findById(req.params.id);

    if (!region) {
      return res.status(404).json({
        success: false,
        message: `Region not found with id of ${req.params.id}`,
      });
    }

    region = await Region.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: region,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Delete region
// @route   DELETE /api/regions/:id
// @access  Private/Admin
exports.deleteRegion = async (req, res) => {
  try {
    const region = await Region.findById(req.params.id);

    if (!region) {
      return res.status(404).json({
        success: false,
        message: `Region not found with id of ${req.params.id}`,
      });
    }

    await region.remove();

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

// @desc    Get region statistics
// @route   GET /api/regions/stats
// @access  Private/Admin
exports.getRegionStats = async (req, res) => {
  try {
    // Get count of officers per region
    const officerStats = await User.aggregate([
      { $match: { role: "officer" } },
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
      { $project: { _id: 1, region: "$region.name", count: 1 } },
    ]);

    // Get count of reports per region
    const reportStats = await Report.aggregate([
      { $group: { _id: "$region", activeReports: { $sum: 1 } } },
      {
        $lookup: {
          from: "regions",
          localField: "_id",
          foreignField: "_id",
          as: "region",
        },
      },
      { $unwind: "$region" },
      { $project: { _id: 1, region: "$region.name", activeReports: 1 } },
    ]);

    // Get total population and area covered
    const totalStats = await Region.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: null,
          totalRegions: { $sum: 1 },
          totalPopulation: { $sum: "$population" },
          totalArea: { $sum: "$area" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        officerStats,
        reportStats,
        totalStats: totalStats[0] || {
          totalRegions: 0,
          totalPopulation: 0,
          totalArea: 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
