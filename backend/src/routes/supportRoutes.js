const express = require("express");
const router = express.Router();
const SupportTicket = require("../models/SupportTicket");

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.hospitalId) filter.hospitalId = req.query.hospitalId;
    const tickets = await SupportTicket.find(filter)
      .populate("hospitalId", "name")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const ticket = await SupportTicket.create(req.body);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
