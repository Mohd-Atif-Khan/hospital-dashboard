const express = require("express");
const router = express.Router();
const Hospital = require("../models/Hospital");

router.get("/", async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/beds", async (req, res) => {
  try {
    const { availableBeds, availableIcuBeds } = req.body;
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ error: "Hospital not found" });

    if (typeof availableBeds === "number") {
      hospital.availableBeds = Math.max(0, Math.min(hospital.totalBeds, availableBeds));
    }
    if (typeof availableIcuBeds === "number") {
      hospital.availableIcuBeds = Math.max(0, Math.min(hospital.icuBeds, availableIcuBeds));
    }

    await hospital.save();
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

