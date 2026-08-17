const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["driver_road", "patient_review"],
    required: true,
  },
  authorName: { type: String, required: true },
  authorRole: { type: String, required: true }, // "Ambulance Driver" | "Patient / Attendant"
  vehicleNumber: { type: String },
  hospitalName: { type: String },
  locationName: { type: String, default: "Kanpur Metro Area" },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  comment: { type: String, required: true },
  trafficDelayMinutes: { type: Number, default: 0 },
  roadStatus: {
    type: String,
    enum: ["Clear", "Congested", "Construction", "Green Corridor"],
    default: "Clear",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", feedbackSchema);
