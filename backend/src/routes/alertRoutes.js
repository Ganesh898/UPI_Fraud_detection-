const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const auth = require('../middleware/auth');

router.get('/', auth.optionalAuth, alertController.getAlerts);
router.post('/:id/confirm-fraud', auth.verifyToken, alertController.confirmFraudAndBlacklist);
router.post('/:id/resolve', auth.verifyToken, alertController.resolveAlert);

module.exports = router;
