require("dotenv").config();
if (!globalThis.crypto) {
  try {
    globalThis.crypto = require("crypto").webcrypto;
  } catch (e) {}
}
const mongoose = require("mongoose");
const Hospital = require("../src/models/Hospital");
const Ambulance = require("../src/models/Ambulance");
const Trip = require("../src/models/Trip");
const SupportTicket = require("../src/models/SupportTicket");
const Feedback = require("../src/models/Feedback");

const DEMO_PASSWORD = "1234";

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Wiping existing demo collections...");

  await Promise.all([
    Hospital.deleteMany({}),
    Ambulance.deleteMany({}),
    Trip.deleteMany({}),
    SupportTicket.deleteMany({}),
    Feedback.deleteMany({}),
  ]);

  const hospitalsData = [
    {
      name: "Allen Life Care Emergency Center, Kanpur",
      location: { lat: 26.4380, lng: 80.3250 },
      totalBeds: 80,
      availableBeds: 25,
      icuBeds: 15,
      availableIcuBeds: 4,
      email: "hospital@123",
      password: DEMO_PASSWORD,
    },
    {
      name: "Regency Hospital, Swaroop Nagar, Kanpur",
      location: { lat: 26.4678, lng: 80.3168 },
      totalBeds: 120,
      availableBeds: 38,
      icuBeds: 25,
      availableIcuBeds: 6,
      email: "citygeneral@example.com",
      password: DEMO_PASSWORD,
    },
    {
      name: "GSVM Medical College & Hospital, Kanpur",
      location: { lat: 26.4748, lng: 80.3015 },
      totalBeds: 150,
      availableBeds: 52,
      icuBeds: 30,
      availableIcuBeds: 8,
      email: "sunrise@example.com",
      password: DEMO_PASSWORD,
    },
    {
      name: "Kanpur Heart Institute, Civil Lines",
      location: { lat: 26.4520, lng: 80.3480 },
      totalBeds: 70,
      availableBeds: 18,
      icuBeds: 15,
      availableIcuBeds: 3,
      email: "greenvalley@example.com",
      password: DEMO_PASSWORD,
    },
  ];


  const hospitals = [];
  for (const data of hospitalsData) {
    const hospital = new Hospital(data);
    await hospital.save();
    hospitals.push(hospital);
  }
  console.log(`Seeded ${hospitals.length} hospitals`);

  const ambulanceStatuses = ["available", "available", "on-trip", "maintenance"];
  const ambulances = [];
  for (const hospital of hospitals) {
    for (let i = 1; i <= 3; i++) {
      const status = ambulanceStatuses[(ambulances.length + i) % ambulanceStatuses.length];
      const amb = await Ambulance.create({
        vehicleNumber: `UP78-AMB-${hospital.name.slice(0, 2).toUpperCase()}-0${i}`,
        driverName: ["Rajesh Kumar", "Suresh Yadav", "Vikram Singh", "Anil Sharma"][
          ambulances.length % 4
        ],
        driverPhone: `98765${(10000 + ambulances.length).toString().slice(-5)}`,
        status,
        hospitalId: hospital._id,
        currentLocation: hospital.location,
      });
      ambulances.push(amb);
    }
  }
  console.log(`Seeded ${ambulances.length} ambulances`);

  console.log(`Seeded ${ambulances.length} ambulances`);

  const sampleTrips = [
    {
      patientName: "Rajesh Sharma",
      patientAge: 58,
      patientGender: "Male",
      priority: "CRITICAL",
      status: "in-transit",
      emergencyNotes: "Patient experiencing severe chest pain radiating to left arm. ST elevation suspected on 12-lead ECG. Prepare Cath Lab.",
      medicalHistory: ["Hypertension", "Type 2 Diabetes", "Previous Angioplasty (2021)"],
      medicalFiles: [
        {
          name: "ECG_Scan_12Lead.pdf",
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          fileType: "PDF",
        },
        {
          name: "Recent_Blood_Report_CardiacEnzymes.pdf",
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          fileType: "PDF",
        },
      ],
      etaMinutes: 8,
      bedReserved: true,
      bedType: "icu",
      vitals: { hr: 115, spo2: 91, bp: "155/95" },
    },
    {
      patientName: "Ananya Deshmukh",
      patientAge: 32,
      patientGender: "Female",
      priority: "URGENT",
      status: "in-transit",
      emergencyNotes: "Acute asthma attack unresponsive to inhaler. Severe wheezing and respiratory distress.",
      medicalHistory: ["Severe Asthma", "Penicillin Allergy"],
      medicalFiles: [
        {
          name: "Pulmonary_Evaluation_Report.pdf",
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          fileType: "PDF",
        },
      ],
      etaMinutes: 14,
      bedReserved: true,
      bedType: "regular",
      vitals: { hr: 98, spo2: 93, bp: "128/82" },
    },
    {
      patientName: "Vikram Malhotra",
      patientAge: 67,
      patientGender: "Male",
      priority: "CRITICAL",
      status: "pending",
      emergencyNotes: "Sudden onset right-sided facial droop and arm weakness. Possible acute ischemic stroke.",
      medicalHistory: ["Atrial Fibrillation", "Hyperlipidemia"],
      medicalFiles: [
        {
          name: "Brain_MRI_Baseline.pdf",
          url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          fileType: "PDF",
        },
      ],
      etaMinutes: 18,
      bedReserved: false,
      bedType: "icu",
      vitals: { hr: 88, spo2: 95, bp: "170/105" },
    },
    {
      patientName: "Pooja Verma",
      patientAge: 29,
      patientGender: "Female",
      priority: "STABLE",
      status: "arrived",
      emergencyNotes: "Minor trauma following road traffic accident. Stable vital signs, laceration on right forearm.",
      medicalHistory: ["No known chronic illness"],
      medicalFiles: [],
      etaMinutes: 0,
      bedReserved: true,
      bedType: "regular",
      vitals: { hr: 76, spo2: 99, bp: "120/80" },
    },
  ];

  const trips = [];
  for (const hospital of hospitals) {
    const hospitalAmbulances = ambulances.filter((a) => a.hospitalId.equals(hospital._id));
    for (let i = 0; i < sampleTrips.length; i++) {
      const template = sampleTrips[i];
      const amb = hospitalAmbulances[i % hospitalAmbulances.length];
      const trip = await Trip.create({
        ...template,
        hospitalId: hospital._id,
        ambulanceId: amb ? amb.vehicleNumber : "AMB-01",
        currentLocation: {
          lat: hospital.location.lat + (Math.random() - 0.5) * 0.03,
          lng: hospital.location.lng + (Math.random() - 0.5) * 0.03,
        },
      });
      trips.push(trip);
    }
  }
  console.log(`Seeded ${trips.length} trips`);


  const supportTickets = [
    {
      patientName: "Meena Joshi",
      phone: "9876543210",
      message: "Ambulance is delayed, patient condition worsening. Need urgent update.",
      hospitalId: hospitals[0]._id,
      status: "open",
    },
    {
      patientName: "Deepak Chawla",
      phone: "9123456780",
      message: "Need to confirm ICU bed availability before dispatch.",
      hospitalId: hospitals[1]._id,
      status: "in-progress",
    },
    {
      patientName: "Farhan Ali",
      phone: "9988776655",
      message: "Billing query regarding trip charges.",
      hospitalId: hospitals[2]._id,
      status: "resolved",
    },
    {
      patientName: "Ritu Kapoor",
      phone: "9012345678",
      message: "Requesting wheelchair assistance on arrival.",
      status: "open",
    },
  ];
  await SupportTicket.insertMany(supportTickets);
  console.log(`Seeded ${supportTickets.length} support tickets`);

  const feedbackItems = [
    {
      type: "driver_road",
      authorName: "Vikram Singh",
      authorRole: "Ambulance Driver",
      vehicleNumber: "UP78-AMB-RE-01",
      hospitalName: "Regency Hospital, Swaroop Nagar",
      locationName: "Tatmill Chauraha, Kanpur",
      rating: 4,
      comment: "Heavy traffic bottleneck near Tatmill Flyover during peak hours (5-7 PM). Recommending alternative fast route via GT Road for Regency dispatches.",
      trafficDelayMinutes: 6,
      roadStatus: "Congested",
    },
    {
      type: "driver_road",
      authorName: "Suresh Yadav",
      authorRole: "Ambulance Driver",
      vehicleNumber: "UP78-AMB-GS-02",
      hospitalName: "GSVM Medical College",
      locationName: "Swaroop Nagar Main Corridor",
      rating: 5,
      comment: "Green corridor activated by Kanpur Traffic Police! Smooth 4-minute travel time from Kakadeo to GSVM Medical College.",
      trafficDelayMinutes: 0,
      roadStatus: "Green Corridor",
    },
    {
      type: "patient_review",
      authorName: "Rajesh Sharma",
      authorRole: "Patient / Attendant",
      hospitalName: "Regency Hospital, Swaroop Nagar",
      locationName: "Civil Lines, Kanpur",
      rating: 5,
      comment: "Outstanding response speed! Ambulance arrived in 6 minutes with full cardiac telemetry monitor active. ICU bed was pre-reserved before arrival.",
    },
    {
      type: "patient_review",
      authorName: "Ananya Deshmukh",
      authorRole: "Patient",
      hospitalName: "GSVM Medical College",
      locationName: "Kalyanpur, Kanpur",
      rating: 5,
      comment: "The nearest hospital matching logic saved critical time during acute asthma attack. Excellent medical assistance.",
    },
  ];
  await Feedback.insertMany(feedbackItems);
  console.log(`Seeded ${feedbackItems.length} feedback entries`);

  console.log("\nDemo hospital login credentials (password for all: hospital123):");
  hospitalsData.forEach((h) => console.log(` - ${h.email}`));
  console.log(
    `\nAdmin login: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`
  );

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
