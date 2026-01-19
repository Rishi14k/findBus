const express = require('express')
const {
  searchBusByNumber,
  getBusCardDetails,
  getBusMiniDetails,
  getBusesBetweenStops,
  getBusesOnRoute,
  getLiveBusesOnRoute,
  getRouteDetails,
  getStopETA,
  getNearestBusesForStop,
} = require("../controllers/User/userController");

const router = express.Router()

//query param ?busNumber=401
router.get('/bus-number/search',searchBusByNumber)
//req.body startStopId,endStopId
router.post('/between-stop/search',getBusesBetweenStops)
router.get('/route/:routeId/buses',getBusesOnRoute)

router.get("/buses/:busId/card", getBusCardDetails);
router.get("/buses/:busId/mini", getBusMiniDetails);
router.get("/routes/:routeId/live-buses", getLiveBusesOnRoute);

router.get('/route-details/:routeId',getRouteDetails)
router.get('/eta/stop/:stopId',getStopETA)
router.get('/nearest/stop/:stopId',getNearestBusesForStop)

module.exports = router