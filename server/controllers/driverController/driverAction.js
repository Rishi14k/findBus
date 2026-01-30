const Bus = require('../../models/Bus');
const Route = require('../../models/Route');
const LiveBus = require('../../models/LiveBus');
const User = require('../../models/User')

const getAllBusesForDriver = async(req,res)=>{
    try {
        const buses = await Bus.find({isActive:true}).populate('routeId');
        return res.status(200).json({success:true, data:buses});
    } catch (error) {
        return res.status(500).json({success:false, message: error.message});
    }
}

const selectBus = async (req, res) => {
  try {
    const {busId} = req.body;
    const driverId = req.user.userId;

    // 1. Check if driver already has an active bus
    const existingDriverBus = await LiveBus.findOne({
      driverId,
      // status: {$ne: "off-duty"}, // running or holding
      assignedBus:true
    });

    if (existingDriverBus) {
      return res.status(400).json({
        success: false,
        message: "You are already assigned to a bus",
      });
    }

    // 2. Check if bus is already assigned to another driver
    // const existingBus = await LiveBus.findOne({
    //   busId,
    //   status: {$ne: "running"},
    // });

    // if (existingBus) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "This bus is already in use",
    //   });
    // }

    // 3. Validate bus
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    // 4. Create LiveBus entry
    const liveBus = await LiveBus.create({
      busId,
      routeId: bus.routeId,
      driverId,
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
      status: "holding", // initial state before running
      assignedBus:true
    });

    res.json({
      success: true,
      data: liveBus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getDriverDashboard = async(req,res)=>{
    try {
        const liveBus = await LiveBus.findOne({
          driverId: req.user.userId,
        }).populate({
          path: "busId",
          populate: {
            path: "routeId",
            populate: {
              path: "stops.stop", // <-- populate each stop inside route
            },
          },
        });
        if(!liveBus){
            return res.status(404).json({success:false, message:"Please select a bus to view dashboard."});
        }
        res.json({
          success: true,
          data: {
            bus: liveBus.busId,
            route: liveBus.busId.routeId,
            status: liveBus ? liveBus.status : "off-duty",
            lastUpdated: liveBus.lastUpdated,
            busId: liveBus.busId._id,
            currentStopIndex: liveBus.currentStopIndex,
            nextStopIndex: liveBus.nextStopIndex,
            speed: liveBus.speed,
            lastLocation: liveBus.location.coordinates, 
          },
        });
    } catch (error) {
        res.status(500).json({success:false, message: error.message});
    }
}

const toggleDuty = async (req, res) => {
  try {
    const {onDuty} = req.body;

    const liveBus = await LiveBus.findOne({driverId: req.user.userId});
    if (!liveBus) {
      return res.status(404).json({
        success: false,
        message: "No bus selected",
      });
    }

    // ✅ Prevent duplicate ON duty
    if (onDuty && liveBus.status === "running") {
      return res.status(400).json({
        success: false,
        message: "Driver already ON duty",
      });
    }

    // ✅ Prevent duplicate OFF duty
    if (!onDuty && liveBus.status === "off-duty") {
      return res.status(400).json({
        success: false,
        message: "Driver already OFF duty",
      });
    }

    liveBus.status = onDuty ? "running" : "off-duty";
    liveBus.lastUpdated = new Date();

    // Optional cleanup when off-duty
    if (!onDuty) {
      liveBus.speed = 0;
      liveBus.heading = null;
    }

    await liveBus.save();

    res.json({
      success: true,
      message: `Driver is now ${onDuty ? "ON" : "OFF"} duty`,
    });
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

const clearSelectedBus = async (req, res) => {
  try {
    const driverId = req.user.userId;

    const deleted = await LiveBus.findOneAndDelete({
      driverId,
      status: {$ne: "running"}, // delete active (running or holding)
    });

    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: "No active bus to clear",
      });
    }

    res.json({
      success: true,
      message: "Bus cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
    getAllBusesForDriver,
    selectBus,
    getDriverDashboard,
    toggleDuty,
    clearSelectedBus
}