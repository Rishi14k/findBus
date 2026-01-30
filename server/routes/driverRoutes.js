const express = require('express');
const {
  getAllBusesForDriver,
  selectBus,
  getDriverDashboard,
  toggleDuty,
  clearSelectedBus,
} = require("../controllers/driverController/driverAction");


const router = express.Router();

router.get('/buses', getAllBusesForDriver);
router.post('/select-bus', selectBus);
router.get('/dashboard', getDriverDashboard);
router.post('/toggle-duty', toggleDuty);
router.post('/clear-bus',clearSelectedBus)

module.exports = router;