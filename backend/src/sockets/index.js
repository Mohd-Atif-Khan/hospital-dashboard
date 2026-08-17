function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("location-update", (data) => {
      io.emit("ambulance-location", data);
    });

    socket.on("vitals-update", (data) => {
      io.emit("live-vitals", data);
    });
  });
}

module.exports = registerSocketHandlers;
