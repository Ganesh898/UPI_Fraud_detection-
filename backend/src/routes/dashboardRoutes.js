const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/stats', auth.optionalAuth, dashboardController.getStats);
router.get('/trajectory', auth.optionalAuth, dashboardController.getTrajectory);

module.exports = router;
