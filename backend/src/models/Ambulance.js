const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  status: {
    type: String,
    enum: ["available", "on-trip", "maintenance"],
    default: "available",
  },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
  currentLocation: {
    lat: Number,
    lng: Number,
  },
});

module.exports = mongoose.model("Ambulance", ambulanceSchema);
