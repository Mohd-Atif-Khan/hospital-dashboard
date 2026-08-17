require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const hospitalRoutes = require("./routes/hospitalRoutes");
const tripRoutes = require("./routes/tripRoutes");
const ambulanceRoutes = require("./routes/ambulanceRoutes");
const supportRoutes = require("./routes/supportRoutes");
const authRoutes = require("./routes/authRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const registerSocketHandlers = require("./sockets");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running" });
});

app.use("/api/hospitals", hospitalRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/ambulances", ambulanceRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

registerSocketHandlers(io);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT} (MongoDB not connected)`);
    });
  });
