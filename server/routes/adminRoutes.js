const express = require('express');
const {
    createRoute,
    getAllRoutes,
    getRouteById,
    updateRoute,
    toggleRouteStatus,
    deleteRoute
} = require('../controllers/Admin/adminRouteController');
const {
    createStop,
    getAllStops,
    updateStop,
    toggleStopStatus
} = require('../controllers/Admin/adminStopController');

const {
  createBus,
  getAllBuses,
  getSingleBus,
  updateBus,
  toggleBusStatus,
  deleteBus,
} = require("../controllers/Admin/adminBusController");
const {authMiddleware} = require('../middleware/authMiddleware')
const {requireAdmin} = require('../middleware/requireAdmin')



const router = express.Router();

// router.use(authMiddleware)
// router.use(requireAdmin)

//stop routes
router.get('/stop',getAllStops)
router.post('/stop/create',createStop)
router.put('/stop/update/:stopId',updateStop)
router.patch('/stop/:stopId/toggle',toggleStopStatus)

//route routes
router.post("/route/create", createRoute);
router.get("/route", getAllRoutes);
router.get("/route/:routeId", getRouteById);
router.put("/route/update/:routeId", updateRoute);
router.patch("/route/:routeId/toggle", toggleRouteStatus);
router.delete("/route/delete/:routeId", deleteRoute);

//bus routes
router.post("/bus/create", createBus);
router.get("/bus", getAllBuses);
router.get("/bus/:busId", getSingleBus);
router.put("/bus/update/:busId", updateBus);
router.patch("/bus/:busId/toggle", toggleBusStatus);
router.delete("/bus/delete/:busId", deleteBus);

module.exports = router