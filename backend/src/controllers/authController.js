const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Hospital = require("../models/Hospital");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

async function login(req, res) {
  const { role, email, password } = req.body;

  if (!role || !email || !password) {
    return res.status(400).json({ error: "role, email and password are required" });
  }

  if (role === "admin") {
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = signToken({ role: "admin", email });
      return res.json({ token, role: "admin", name: "Admin" });
    }
    return res.status(401).json({ error: "Invalid admin credentials" });
  }

  if (role === "hospital") {
    const hospital = await Hospital.findOne({ email });
    if (!hospital) return res.status(401).json({ error: "Invalid hospital credentials" });

    const match = await bcrypt.compare(password, hospital.password);
    if (!match) return res.status(401).json({ error: "Invalid hospital credentials" });

    const token = signToken({ role: "hospital", hospitalId: hospital._id, email });
    return res.json({
      token,
      role: "hospital",
      hospitalId: hospital._id,
      name: hospital.name,
    });
  }

  return res.status(400).json({ error: "role must be 'admin' or 'hospital'" });
}

module.exports = { login };
