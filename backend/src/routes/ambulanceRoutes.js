const express = require("express");
const router = express.Router();
const Ambulance = require("../models/Ambulance");

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.hospitalId) filter.hospitalId = req.query.hospitalId;
    const ambulances = await Ambulance.find(filter).populate("hospitalId", "name");
    res.json(ambulances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const ambulance = await Ambulance.create(req.body);
    res.status(201).json(ambulance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { status, currentLocation } = req.body;
    const update = {};
    if (status) update.status = status;
    if (currentLocation) update.currentLocation = currentLocation;
    const ambulance = await Ambulance.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ambulance) return res.status(404).json({ error: "Ambulance not found" });
    res.json(ambulance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
