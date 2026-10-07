const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const validation = require('../middleware/validation');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

router.post('/manual', auth.optionalAuth, validation.validateVerification, verificationController.verifyPayment);
router.post('/simulate', auth.optionalAuth, verificationController.evaluateSimulation);
router.post('/screenshot', auth.optionalAuth, upload.single('receipt'), verificationController.verifyScreenshot);

module.exports = router;
