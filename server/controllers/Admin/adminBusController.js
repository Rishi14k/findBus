const Bus = require("../../models/Bus");
const Route = require("../../models/Route");

const createBus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins only",
      });
    }
    const {busNumber, routeId, fare, serviceType} = req.body;

    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({success: false, message: "Route not found"});
    }
    if (!busNumber || !routeId || fare == null) {
      return res
        .status(400)
        .json({
          success: false,
          message: "busNumber, routeId and fare are required",
        });
    }

    const exsitingBus = await Bus.findOne({busNumber});
    if (exsitingBus) {
      return res
        .status(400)
        .json({success: false, message: "Bus with this number already exists"});
    }

    const bus = await Bus.create({
      busNumber,
      routeId,
      fare,
      serviceType: serviceType || "Non A/C",
      totalStops: route.stops.length,
    });

    res.status(201).json({
      success: true,
      message: "Bus created successfully",
      data: bus,
    });
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find()
      .populate("routeId", "routeName routeCode")
      .sort({createdAt: -1});
    if (!buses) {
      return res.status(404).json({success: false, message: "No buses found"});
    }
    res.status(200).json({success: true, data: buses});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleBus = async (req, res) => {
  try {
    const {busId} = req.params;
    const bus = await Bus.findById(busId).populate("routeId");
    if (!bus) {
      return res.status(400).json({success: false, message: "Bus not found"});
    }
    res.status(200).json({success: true,data: bus});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins only",
      });
    }

    const {busId} = req.params;
    const updates = req.body;

    // If route is changed → update totalStops
    if (updates.routeId) {
      const route = await Route.findById(updates.routeId);
      if (!route) {
        return res.status(404).json({
          success: false,
          message: "New route not found",
        });
      }
      updates.totalStops = route.stops.length;
    }

    const bus = await Bus.findByIdAndUpdate(busId, updates, {new: true});

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    res.json({
      success: true,
      message: "Bus updated successfully",
      data:bus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const toggleBusStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins only",
      });
    }

    const bus = await Bus.findById(req.params.busId);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    bus.isActive = !bus.isActive;
    await bus.save();

    res.json({
      success: true,
      message: `Bus ${bus.isActive ? "activated" : "deactivated"}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins only",
      });
    }

    await Bus.findByIdAndDelete(req.params.busId);

    res.json({
      success: true,
      message: "Bus deleted permanently",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBus,
  getAllBuses,
  getSingleBus,
  updateBus,
  toggleBusStatus,
  deleteBus
};
