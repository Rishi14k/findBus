const Route = require("../../models/Route");
const Stop = require("../../models/Stop");

const {generateRoutePolyline} = require("../../utils/routeUtils");

const createRoute = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({success: false, message: "Access denied"});
    }

    const {routeName, routeCode, stops} = req.body;

    if (!routeName || !routeCode || !stops || stops.length < 2) {
      return res.status(400).json({
        success: false,
        message: "routeName, routeCode and at least two stops are required",
      });
    }

    const existingRoute = await Route.findOne({routeCode});
    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: "Route code already exists",
      });
    }

    // 1️⃣ Sort stops
    const sortedStops = stops.sort((a, b) => a.order - b.order);

    // 2️⃣ Fetch stop coordinates
    const stopDocs = await Stop.find({
      _id: {$in: sortedStops.map((s) => s.stop)},
    });

    // 3️⃣ Maintain correct order
    const stopMap = {};
    stopDocs.forEach((s) => {
      stopMap[s._id] = s;
    });

    const coordinates = sortedStops.map((s) => {
      const stop = stopMap[s.stop];
      console.log(`Stop ID: ${s.stop}, Coords: ${stop.location.coordinates}`);
      return stop.location.coordinates; // [lng, lat]
    });

    // 4️⃣ Generate polyline + distance
    const {polyline, distance} = await generateRoutePolyline(coordinates);

    // 5️⃣ Create route
    const route = await Route.create({
      routeName,
      routeCode,
      stops: sortedStops,
      polyline,
      totalDistance: distance,
    });

    res.status(201).json({
      success: true,
      message: "Route created successfully",
      data: route,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({success: false, message: error.message});
  }
};



const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find().sort({createdAt: -1});

    res.json({
      success: true,
      data:routes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.routeId).populate(
      "stops.stopId"
    );
    if (!route) {
      return res.status(404).json({success: false, message: "Route not found"});
    }
    res.status(200).json({success: true, data: route});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

const updateRoute = async (req, res) => {
   try {
     if (req.user.role !== "admin") {
       return res.status(403).json({success: false, message: "Access denied"});
     }

     const {routeId} = req.params;
     const updates = {...req.body};

     if (updates.stops && updates.stops.length >= 2) {
       // 1️⃣ sort stops
       const sortedStops = updates.stops.sort((a, b) => a.order - b.order);

       // 2️⃣ fetch stop docs
       const stopDocs = await Stop.find({
         _id: {$in: sortedStops.map((s) => s.stop)},
       });

       if (stopDocs.length !== sortedStops.length) {
         return res.status(400).json({
           success: false,
           message: "One or more stops do not exist",
         });
       }

       // 3️⃣ map stops by id
       const stopMap = {};
       stopDocs.forEach((s) => {
         stopMap[s._id.toString()] = s;
       });

       // 4️⃣ build coordinates in correct order
       const coordinates = sortedStops.map((s) => {
         const stop = stopMap[s.stop.toString()];
         return stop.location.coordinates; // [lng, lat]
       });

       // 5️⃣ generate polyline + distance
       const {polyline, distance} = await generateRoutePolyline(coordinates);

       // 6️⃣ override fields
       updates.stops = sortedStops;
       updates.polyline = polyline;
       updates.totalDistance = distance;
     }

     /**
      * 2️⃣ Update route
      */
     const route = await Route.findByIdAndUpdate(routeId, updates, {
       new: true,
     });

     if (!route) {
       return res.status(404).json({
         success: false,
         message: "Route not found",
       });
     }

     res.status(200).json({
       success: true,
       message: "Route updated successfully",
       data: route,
     });
   } catch (error) {
     console.error(error);
     res.status(500).json({success: false, message: error.message});
   }
};

const toggleRouteStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({success: false, message: "Access denied"});
    }
    const {routeId} = req.params;
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({success: false, message: "Route not found"});
    }
    route.isActive = !route.isActive;
    await route.save();
       res.json({
         success: true,
         message: `Route ${route.isActive ? "activated" : "deactivated"}`,
       });

  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

const deleteRoute = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins only",
      });
    }

    await Route.findByIdAndDelete(req.params.routeId);

    res.json({
      success: true,
      message: "Route deleted permanently",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
    createRoute,
    getAllRoutes,
    getRouteById,
    updateRoute,
    toggleRouteStatus,
    deleteRoute
}