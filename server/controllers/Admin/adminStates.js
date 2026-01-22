const Bus = require('../../models/Bus')
const Route = require("../../models/Route")
const Stop = require("../../models/Stop")
const User = require("../../models/User")

const getAdminStats = async(req,res)=>{
    try {
         if (req.user.role !== "admin") {
           return res.status(403).json({
             success: false,
             message: "Admins only",
           });
         }

          const [
            totalBuses,
            totalRoutes,
            totalStops,
            activeBuses,
            totalDrivers,
          ] = await Promise.all([
            Bus.countDocuments(),
            Route.countDocuments(),
            Stop.countDocuments(),
            Bus.countDocuments({isActive: true}),
            User.countDocuments({role: "driver"}),
          ]);

           return res.status(200).json({
             success: true,
             stats: {
               buses: totalBuses,
               routes: totalRoutes,
               stops: totalStops,
               activeBuses,
               drivers: totalDrivers,
             },
           });
    } catch (error) {
          return res.status(500).json({
            success: false,
            message: "Failed to fetch admin stats",
            error: error.message,
          });
    }
}

const getDrivers = async(req,res)=>{
  try {
    
  const drivers = await User.find({role: "driver"});
  res.status(200).json({success:true, data:drivers})
  } catch (error) {
  res.stats(500).json({success: false, message: error.message});
  }
}

const deleteDriver = async(req,res)=>{
  try {
     if (req.user.role !== "admin") {
       return res.status(403).json({
         success: false,
         message: "Admins only",
       });
     }

     await User.findByIdAndDelete(req.params.userId)
      res.json({
        success: true,
        message: "Driver deleted permanently",
      });
  } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
  }
}

module.exports = {getAdminStats,getDrivers,deleteDriver}