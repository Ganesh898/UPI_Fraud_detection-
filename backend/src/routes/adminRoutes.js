const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');

// All admin routes strictly enforce JWT authentication and Admin role guard
router.use(auth.verifyToken, auth.requireAdmin);

// Rules Configuration
router.get('/rules', adminController.getFraudRules);
router.put('/rules/:id/weight', adminController.updateRuleWeight);
router.put('/rules/:id/toggle', adminController.toggleRule);

// National VPA Blacklist Management
router.get('/blacklist', adminController.getBlacklist);
router.post('/blacklist', validation.validateBlacklist, adminController.addBlacklist);
router.delete('/blacklist/:id', adminController.removeBlacklist);

// Compliance Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
