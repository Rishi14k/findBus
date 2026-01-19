const Route = require("../../models/Route");
const Stop = require("../../models/Stop");

const createRoute = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({success: false, message: "Access denied"});
    }
    const {routeName, routeCode, stops, polyline, totalDistance} = req.body;
    if (!routeName || !routeCode || !stops || stops.length < 2) {
      return res.status(400).json({
        success: false,
        message: "routeName, routeCode and at least two stops are required",
      });
    }

    const existingRouteCode = await Route.findOne({routeCode});
    if (existingRouteCode) {
      return res
        .status(400)
        .json({success: false, message: "Route code already exists"});
    }

    const sortedStops = stops.sort((a, b) => a.order - b.order);

    const stopIds = stops.map((s) => s.stopId);

    const existingStops = await Stop.find({_id: {$in: stopIds}});

    if (existingStops.length !== stopIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more stops do not exist",
      });
    }


    const route = await Route.create({
      routeName,
      routeCode,
      stops: sortedStops,
      polyline,
      totalDistance,
    });

    res.status(201).json({
      success: true,
      message: "Route created successfully",
      data: route,
    });
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find().sort({createdAt: -1});

    res.json({
      success: true,
      routes,
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
    const updates = req.body;

    if (updates.stops) {
      updates.stops = updates.stops.sort((a, b) => a.order - b.order);
    }
    const route = await Route.findByIdAndUpdate(routeId, updates, {new: true});
    if (!route) {
      return res.status(404).json({success: false, message: "Route not found"});
    }
    res.status(200).json({
      success: true,
      message: "Route updated successfully",
      route,
    });
  } catch (error) {
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