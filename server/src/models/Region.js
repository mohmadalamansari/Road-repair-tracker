const mongoose = require("mongoose");

const RegionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a region name"],
    unique: true,
    trim: true,
  },
  type: {
    type: String,
    enum: [
      "Urban",
      "Suburban",
      "Rural",
      "Industrial",
      "Commercial",
      "Residential",
    ],
    required: [true, "Please specify region type"],
  },
  population: {
    type: Number,
    required: [true, "Please provide population estimate"],
  },
  area: {
    type: Number,
    required: [true, "Please provide area in square kilometers"],
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
  // For Leaflet.js, store boundaries as GeoJSON
  boundaries: {
    type: {
      type: String,
      enum: ["Polygon"],
      default: "Polygon",
    },
    coordinates: {
      type: [[[Number]]], // Array of arrays of arrays of numbers
      default: [],
    },
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

module.exports = mongoose.model("Region", RegionSchema);
