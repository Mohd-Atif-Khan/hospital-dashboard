const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  status: {
    type: String,
    enum: ["open", "in-progress", "resolved"],
    default: "open",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
