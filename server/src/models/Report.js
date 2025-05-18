const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a report title"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
    maxlength: [1000, "Description cannot be more than 1000 characters"],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Please provide a category"],
  },
  severity: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium",
  },
  status: {
    type: String,
    enum: [
      "Pending",
      "Assigned",
      "In Progress",
      "Resolved",
      "Closed",
      "Rejected",
      "Cancelled",
    ],
    default: "Pending",
  },
  location: {
    address: {
      type: String,
      required: [true, "Please provide an address"],
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, "Please provide latitude"],
      },
      lng: {
        type: Number,
        required: [true, "Please provide longitude"],
      },
    },
  },
  photos: [
    {
      type: String, // URLs to uploaded photos
    },
  ],
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Region",
  },
  // For tracking report progress
  updates: [
    {
      message: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: [
          "Pending",
          "Assigned",
          "In Progress",
          "Resolved",
          "Closed",
          "Rejected",
          "Cancelled",
        ],
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // For citizen feedback after resolution
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    submittedAt: {
      type: Date,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
});

// Creating compound index for efficient geo-queries with Leaflet.js
ReportSchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model("Report", ReportSchema);
