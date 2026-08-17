const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientAge: { type: Number, default: 45 },
  patientGender: { type: String, default: "Male" },
  priority: {
    type: String,
    enum: ["CRITICAL", "URGENT", "STABLE"],
    default: "CRITICAL",
  },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
  ambulanceId: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "in-transit", "arrived"],
    default: "pending",
  },
  emergencyNotes: { type: String, default: "Chest pain and breathing difficulty reported via patient app." },
  medicalHistory: [{ type: String }],
  medicalFiles: [
    {
      name: String,
      url: String,
      fileType: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  etaMinutes: { type: Number, default: 12 },
  bedReserved: { type: Boolean, default: false },
  bedType: { type: String, enum: ["icu", "regular"], default: "regular" },
  vitals: {
    hr: Number,
    spo2: Number,
    bp: String,
  },
  currentLocation: {
    lat: Number,
    lng: Number,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Trip", tripSchema);

