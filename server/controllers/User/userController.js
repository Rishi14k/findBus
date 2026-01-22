const Bus = require("../../models/Bus");
const Route = require("../../models/Route");
const Stop = require("../../models/Stop");
const LiveBus = require("../../models/LiveBus");
const { getDistanceInKm } = require("../../utils/geo");
const { calculateRouteETA } = require("../../utils/etaUtils");


const searchBusByNumber = async (req, res) => {
  try {
    const {busNumber} = req.query;
    if (!busNumber) {
      return res
        .status(400)
        .json({success: false, message: "Bus Number required.."});
    }
    busNumber.trim()
    console.log(busNumber)
    const buses = await Bus.find({
      busNumber: new RegExp(busNumber, "i"),
      isActive: true,
    }).populate("routeId");

    res.status(200).json({
      success: true,
      count: buses.length,
      data:buses,
    });
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

const getBusesBetweenStops = async (req, res) => {
  try {
    const {startStopId, endStopId} = req.body;

    if (!startStopId || !endStopId) {
      return res.status(400).json({
        success: false,
        message: "Start & End stop required",
      });
    }

    const routes = await Route.find({
      "stops.stopId": {$all: [startStopId, endStopId]},
    });

    const routeIds = routes.map((r) => r._id);

    const buses = await Bus.find({
      routeId: {$in: routeIds},
      isActive: true,
    }).populate("routeId");

    res.json({success: true, data:buses});
  } catch (err) {
    res.status(500).json({success: false, message: err.message});
  }
};

const getBusesOnRoute = async (req, res) => {
  try {
    const {routeId} = req.params;

    const buses = await Bus.find({
      routeId,
      isActive: true,
    });

    res.json({success: true, data:buses});
  } catch (err) {
    res.status(500).json({success: false, message: err.message});
  }
};


const getBusCardDetails = async (req, res) => {
  try {
    const {busId} = req.params;
    const {startStopId} = req.query;

    const bus = await Bus.findById(busId).populate({
      path: "routeId",
      populate: {path: "stops.stopId"},
    });
    if (!bus) {
      return res.status(404).json({success: false, message: "Bus not found"});
    }

    const liveBus = await LiveBus.find({busId});
    if (!liveBus) {
      return res.status(400).json({success: false, message: "No live bus"});
    }

    // Fake ETA logic (you will replace with distance-based ETA)
    const eta = liveBus.length ? ["3 min", "8 min", "15 min"] : [];

    res.json({
      success: true,
      busNumber: bus.busNumber,
      totalStops: bus.routeId.stops.length,
      eta,
      route: bus.routeId,
    });
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

const getLiveBusesOnRoute = async (req, res) => {
  try {
    const {routeId} = req.params;

    const liveBuses = await LiveBus.find({
      routeId,
      status: "running",
    }).populate("busId");

    if(!liveBuses){
      return res.status(400).json({message:"No live bus for this route"})
    }

    res.json({
      success: true,
      data:liveBuses,
    });
  } catch (err) {
    res.status(500).json({success: false, message: err.message});
  }
};


const getRouteDetails = async(req,res)=>{
   try {
     const {routeId} = req.params;

     const route = await Route.findById(routeId).populate("stops.stopId");

     if (!route) {
       return res
         .status(404)
         .json({success: false, message: "Route not found"});
     }

     res.json({
       success: true,
       data:route,
     });
   } catch (err) {
     res.status(500).json({success: false, message: err.message});
   }
}

const getStopETA = async (req, res) => {
  try {
    const {stopId} = req.params;
    const {busId} = req.query;

    const liveBus = await LiveBus.findOne({
      busId,
      status: "running",
    });

    if (!liveBus) {
      return res.json({
        success: true,
        message: "Bus not live",
      });
    }

    const route = await Route.findById(liveBus.routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    const stopIndex = route.stops.findIndex(
      (s) => s.stopId.toString() === stopId
    );

    if (stopIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Stop not found on this route",
      });
    }

    const stop = route.stops[stopIndex];

    const [busLng, busLat] = liveBus.location.coordinates;
    const [stopLng, stopLat] = stop.location.coordinates;

    const distanceKm = getDistanceInKm(busLat, busLng, stopLat, stopLng);

    // speed fallback: 25 km/h if GPS speed missing
    const speedKmph = liveBus.speed > 5 ? liveBus.speed : 30;

    const etaMinutes = Math.ceil((distanceKm / speedKmph) * 60);

    res.json({
      success: true,
      distanceKm: distanceKm.toFixed(2),
      etaMinutes,
    });
  } catch (err) {
    res.status(500).json({success: false, message: err.message});
  }
};


const getBusMiniDetails = async (req, res) => {
  try {
    const {busId} = req.params;

    const liveBus = await LiveBus.findOne({
      busId,
      status: "running",
    }).populate({
      path: "busId",
      populate: {path: "routeId"},
    });

    if (!liveBus) {
      return res.status(404).json({
        success: false,
        message: "Bus not live",
      });
    }

    res.json({
      success: true,
      data: {
        busNumber: liveBus.busId.busNumber,
        speed: liveBus.speed,
        status: liveBus.status,
        routeName: liveBus.busId.routeId.routeName,
        lastUpdated: liveBus.lastUpdated,
      },
    });
  } catch (err) {
    res.status(500).json({success: false, message: err.message});
  }
};


const getNearestBusesForStop = async (req, res) => {
  try {
    const {stopId} = req.params;
    const {routeId, limit = 3} = req.query;

    if (!routeId) {
      return res.status(400).json({
        success: false,
        message: "routeId required",
      });
    }

    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    const targetStopIndex = route.stops.findIndex(
      (s) => s.stopId.toString() === stopId
    );

    if (targetStopIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Stop not in this route",
      });
    }

    const liveBuses = await LiveBus.find({
      routeId,
      status: "running",
    }).populate("busId");

    const etaResults = [];

    for (const liveBus of liveBuses) {
      // Skip buses that already crossed the stop
      if (
        liveBus.currentStopIndex != null &&
        liveBus.currentStopIndex >= targetStopIndex
      ) {
        continue;
      }

      const {etaMinutes, distanceKm} = calculateRouteETA({
        routeStops: route.stops,
        liveBus,
        targetStopIndex,
      });

      etaResults.push({
        busId: liveBus.busId._id,
        busNumber: liveBus.busId.busNumber,
        etaMinutes,
        distanceKm: Number(distanceKm.toFixed(2)),
        location: liveBus.location,
        speed: liveBus.speed,
      });
    }

    // Sort by ETA
    etaResults.sort((a, b) => a.etaMinutes - b.etaMinutes);

    res.json({
      success: true,
      stopId,
      count: etaResults.length,
      buses: etaResults.slice(0, Number(limit)),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


module.exports = {
  searchBusByNumber,
  getBusCardDetails,
  getBusMiniDetails,
  getBusesBetweenStops,
  getBusesOnRoute,
  getLiveBusesOnRoute,
  getRouteDetails,
  getStopETA,
  getNearestBusesForStop,
};