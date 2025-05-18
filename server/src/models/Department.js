const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a department name"],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please provide a department description"],
  },
  headOfficer: {
    type: String,
    required: [true, "Please provide a head officer name"],
  },
  headquarters: {
    type: String,
    required: [true, "Please provide a department headquarters location"],
  },
  location: {
    coordinates: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
    address: {
      type: String,
    },
  },
  officersCount: {
    type: Number,
    default: 0,
  },
  contactEmail: {
    type: String,
    trim: true,
  },
  contactPhone: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Department", DepartmentSchema);
