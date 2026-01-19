const {Server} = require("socket.io");
const jwt = require("jsonwebtoken");
const LiveBus = require("../models/LiveBus");
const { findNearestStopIndex } = require("./stopUtils");
const Route = require("../models/Route");
const { getDistanceInKm } = require("./geo");


function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { userId, role }

      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinDriverBus", async () => {
      if (socket.user.role !== "driver") return;

      const liveBus = await LiveBus.findOne({
        driverId: socket.user.userId,
        status: "running",
      });

      if (!liveBus) return;

      socket.join(`bus:${liveBus.busId}`);
    });


    // 🚍 DRIVER LOCATION UPDATE
   socket.on("driverLocationUpdate", async (data) => {
     try {
       if (socket.user.role !== "driver") return;

       const {lat, lng, speed = 0, heading} = data;
       const driverId = socket.user.userId;

       const liveBus = await LiveBus.findOne({
         driverId,
         status: "running",
       });

       if (!liveBus) return;

       // ⏱️ Throttle FIRST
       if (
         liveBus.lastUpdated &&
         Date.now() - liveBus.lastUpdated.getTime() < 3000
       ) {
         return;
       }

       const route = await Route.findById(liveBus.routeId);
       if (!route || !route.stops?.length) return;

       const {nearestIndex, minDistance} = findNearestStopIndex(
         route.stops,
         lat,
         lng
       );

       // 🚏 Stop detection (50 meters)
       if (minDistance < 0.05) {
         liveBus.currentStopIndex = nearestIndex;
         liveBus.nextStopIndex =
           nearestIndex + 1 < route.stops.length ? nearestIndex + 1 : null;
       }

       // ⏱️ ETA calculation
       let eta = null;
       const nextStop =
         liveBus.nextStopIndex !== null
           ? route.stops[liveBus.nextStopIndex]
           : null;

       // Convert speed m/s ➜ km/h
       const speedKmph = speed * 3.6;

       if (nextStop && speedKmph > 8) {
         const distanceKm = getDistanceInKm(lat, lng, nextStop.lat, nextStop.lng);
         eta = Math.ceil((distanceKm / speedKmph) * 60); // minutes
       }

       // 📍 Update live bus
       liveBus.location = {
         type: "Point",
         coordinates: [lng, lat],
       };
       liveBus.speed = speedKmph;
       liveBus.heading = heading;
       liveBus.lastUpdated = new Date();

       await liveBus.save();

       // 📡 Emit to users
       io.to(`bus:${liveBus.busId}`).emit("busLocationUpdate", {
         busId: liveBus.busId,
         location: liveBus.location,
         speed: speedKmph,
         heading,
         currentStopIndex: liveBus.currentStopIndex,
         nextStopIndex: liveBus.nextStopIndex,
         etaToNextStop: eta,
         updatedAt: liveBus.lastUpdated,
       });
     } catch (error) {
       console.error("Error updating driver location:", error.message);
     }
   });


    socket.on("heartbeat", async () => {
      if (socket.user?.role !== "driver") return;

      await LiveBus.findOneAndUpdate(
        {driverId: socket.user.userId},
        {lastSeenAt: new Date()}
      )
    });

    socket.on("joinBusTracking", ({busId}) => {
      socket.join(`bus:${busId}`);
    });

    socket.on("leaveBusTracking", ({busId}) => {
      socket.leave(`bus:${busId}`);
    });

    socket.on("busLocationUpdate", (data) => {
      // frontend handles map update
    });


    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}`);

      if (socket.user?.role === "driver") {
        await LiveBus.findOneAndUpdate(
          {driverId: socket.user.userId, status: "running"},
          {status: "off-duty", lastUpdated: new Date()}
        );
      }
    });


  });

  return io;
}

module.exports = {initializeSocket};
