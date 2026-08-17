const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const Hospital = require("../models/Hospital");
const Ambulance = require("../models/Ambulance");
const { findNearestHospitalAndAmbulance } = require("../utils/geoUtils");

// GET all trips (for Admin overview)
router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find().populate("hospitalId", "name").sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET trips for a specific hospital
router.get("/:hospitalId", async (req, res) => {
  try {
    const trips = await Trip.find({ hospitalId: req.params.hospitalId }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Automatic Nearest Dispatch Endpoint (Kanpur Emergency Matching)
router.post("/dispatch-nearest", async (req, res) => {
  try {
    const {
      patientName,
      patientAge,
      patientGender,
      priority,
      emergencyNotes,
      patientLocation,
      bedType = "regular",
      medicalHistory,
      medicalFiles,
    } = req.body;

    const patientLat = patientLocation?.lat || 26.4600;
    const patientLng = patientLocation?.lng || 80.3200;

    // Find nearest hospital with bed capacity & nearest available ambulance in Kanpur
    const match = await findNearestHospitalAndAmbulance(
      Hospital,
      Ambulance,
      patientLat,
      patientLng,
      bedType
    );

    // Reserve bed in nearest hospital
    const hospital = match.hospital;
    if (bedType === "icu" && hospital.availableIcuBeds > 0) {
      hospital.availableIcuBeds -= 1;
    } else if (hospital.availableBeds > 0) {
      hospital.availableBeds -= 1;
    }
    await hospital.save();

    // Mark assigned ambulance on-trip
    const ambulance = match.ambulance;
    ambulance.status = "on-trip";
    await ambulance.save();

    // Create emergency dispatch trip record
    const trip = await Trip.create({
      patientName: patientName || "Emergency Patient",
      patientAge: patientAge || 45,
      patientGender: patientGender || "Male",
      priority: priority || "CRITICAL",
      emergencyNotes: emergencyNotes || "Emergency distress call triggered from patient mobile app in Kanpur.",
      hospitalId: hospital._id,
      ambulanceId: ambulance.vehicleNumber,
      status: "in-transit",
      bedReserved: true,
      bedType,
      etaMinutes: match.etaMinutes,
      medicalHistory: medicalHistory || ["None reported"],
      medicalFiles: medicalFiles || [],
      vitals: { hr: 112, spo2: 92, bp: "148/92" },
      currentLocation: { lat: patientLat, lng: patientLng },
    });

    res.status(201).json({
      trip,
      hospital: { _id: hospital._id, name: hospital.name, distanceKm: match.hospitalDistanceKm },
      ambulance: { vehicleNumber: ambulance.vehicleNumber, driverName: ambulance.driverName, distanceKm: match.ambulanceDistanceKm },
      etaMinutes: match.etaMinutes,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const trip = await Trip.create(req.body);

    // Auto-reserve bed if allocated to hospital and requested
    if (trip.hospitalId && (trip.status === "accepted" || trip.status === "in-transit" || trip.bedReserved)) {
      const hospital = await Hospital.findById(trip.hospitalId);
      if (hospital) {
        if (trip.bedType === "icu" && hospital.availableIcuBeds > 0) {
          hospital.availableIcuBeds -= 1;
        } else if (hospital.availableBeds > 0) {
          hospital.availableBeds -= 1;
        }
        await hospital.save();
      }
    }

    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { status, bedReserved, bedType } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const prevStatus = trip.status;
    const prevReserved = trip.bedReserved;

    if (status) trip.status = status;
    if (typeof bedReserved === "boolean") trip.bedReserved = bedReserved;
    if (bedType) trip.bedType = bedType;

    await trip.save();

    // Trigger bed auto-reservation when moving to accepted/in-transit if not previously reserved
    if (!prevReserved && (trip.status === "accepted" || trip.status === "in-transit")) {
      const hospital = await Hospital.findById(trip.hospitalId);
      if (hospital) {
        if (trip.bedType === "icu" && hospital.availableIcuBeds > 0) {
          hospital.availableIcuBeds -= 1;
        } else if (hospital.availableBeds > 0) {
          hospital.availableBeds -= 1;
        }
        trip.bedReserved = true;
        await Promise.all([hospital.save(), trip.save()]);
      }
    }

    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


