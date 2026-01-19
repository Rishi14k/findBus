const Bus = require('../../models/Bus');
const Route = require('../../models/Route');
const LiveBus = require('../../models/LiveBus');


const getAllBusesForDriver = async(req,res)=>{
    try {
        const buses = await Bus.find({isActive:true}).populate('routeId');
        return res.status(200).json({success:true, buses});
    } catch (error) {
        return res.status(500).json({success:false, message: error.message});
    }
}

const selectBus = async (req, res) => {
  try {
    const {busId} = req.body;

    const existing = await LiveBus.findOne({
      driverId: req.user._id,
      status: {$ne: "off-duty"},
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You are already assigned to a bus",
      });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({success: false, message: "Bus not found"});
    }

    const liveBus = await LiveBus.create({
      busId,
      routeId: bus.routeId,
      driverId: req.user._id,
      location: {
        type: "Point",
        coordinates: [0, 0], // placeholder
      },
      status: "off-duty",
    });

    res.json({success: true, data: liveBus});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};


const getDriverDashboard = async(req,res)=>{
    try {
        const liveBus = await LiveBus.findOne({driverId:req.user._id}).populate({
            path:'busId',
            populate:{path:'routeId'}
        })
        if(!liveBus){
            return res.status(404).json({success:false, message:"Please select a bus to view dashboard."});
        }
        res.json({
            success:true,
            data:{
                bus:liveBus.busId,
                route:liveBus.busId.routeId,
                status: liveBus.status,
                lastUpdated: liveBus.lastUpdated,
            }
        })
    } catch (error) {
        res.status(500).json({success:false, message: error.message});
    }
}

const toggleDuty = async (req, res) => {
  try {
    const {onDuty} = req.body;

    const liveBus = await LiveBus.findOne({driverId: req.user._id});
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

module.exports = {
    getAllBusesForDriver,
    selectBus,
    getDriverDashboard,
    toggleDuty
}