const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

router.get('/', auth.optionalAuth, transactionController.getTransactions);
router.get('/:id', auth.optionalAuth, transactionController.getTransactionById);
router.patch('/:id/status', auth.verifyToken, transactionController.updateStatus);

module.exports = router;
