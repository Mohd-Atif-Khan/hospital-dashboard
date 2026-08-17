const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  totalBeds: { type: Number, required: true },
  availableBeds: { type: Number, required: true },
  icuBeds: { type: Number, required: true },
  availableIcuBeds: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

hospitalSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("Hospital", hospitalSchema);
