/**
 * Utility functions for Kanpur Emergency GIS operations and nearest facility matching.
 */

// Calculate Haversine distance in kilometers between two lat/lng coordinates
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the nearest hospital with available bed capacity and the nearest available ambulance in Kanpur.
 */
async function findNearestHospitalAndAmbulance(Hospital, Ambulance, patientLat, patientLng, bedType = "regular") {
  const hospitals = await Hospital.find();
  const ambulances = await Ambulance.find();

  // Filter hospitals that have available beds for the requested bed type
  const eligibleHospitals = hospitals.filter((h) => {
    if (bedType === "icu") return h.availableIcuBeds > 0;
    return h.availableBeds > 0;
  });

  if (eligibleHospitals.length === 0) {
    throw new Error("No hospitals with available bed capacity found in Kanpur region.");
  }

  // Calculate distance to each eligible hospital
  const hospitalsWithDistance = eligibleHospitals.map((h) => {
    const distanceKm = getDistanceKm(patientLat, patientLng, h.location.lat, h.location.lng);
    return { hospital: h, distanceKm };
  });

  // Sort hospitals by distance (ascending)
  hospitalsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  const nearestHospitalMatch = hospitalsWithDistance[0];

  // Filter available ambulances
  const availableAmbulances = ambulances.filter((a) => a.status === "available");

  // Prefer ambulances assigned to the selected hospital, or fall back to any available ambulance in Kanpur
  let candidateAmbulances = availableAmbulances.filter((a) =>
    a.hospitalId.equals(nearestHospitalMatch.hospital._id)
  );

  if (candidateAmbulances.length === 0) {
    candidateAmbulances = availableAmbulances;
  }

  if (candidateAmbulances.length === 0) {
    throw new Error("No available ambulances found in Kanpur network.");
  }

  // Calculate distance for candidate ambulances
  const ambulancesWithDistance = candidateAmbulances.map((a) => {
    const ambLat = a.currentLocation?.lat || nearestHospitalMatch.hospital.location.lat;
    const ambLng = a.currentLocation?.lng || nearestHospitalMatch.hospital.location.lng;
    const distanceKm = getDistanceKm(patientLat, patientLng, ambLat, ambLng);
    return { ambulance: a, distanceKm };
  });

  ambulancesWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  const nearestAmbulanceMatch = ambulancesWithDistance[0];

  // Estimate ETA based on distance (assumes emergency response speed ~35 km/h in Kanpur traffic)
  const etaMinutes = Math.max(3, Math.round((nearestAmbulanceMatch.distanceKm / 35) * 60));

  return {
    hospital: nearestHospitalMatch.hospital,
    hospitalDistanceKm: Number(nearestHospitalMatch.distanceKm.toFixed(2)),
    ambulance: nearestAmbulanceMatch.ambulance,
    ambulanceDistanceKm: Number(nearestAmbulanceMatch.distanceKm.toFixed(2)),
    etaMinutes,
  };
}

module.exports = {
  getDistanceKm,
  findNearestHospitalAndAmbulance,
};
