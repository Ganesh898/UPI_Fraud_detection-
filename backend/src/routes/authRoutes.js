const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validation = require('../middleware/validation');
const auth = require('../middleware/auth');

router.post('/register', validation.validateRegister, authController.register);
router.post('/login', validation.validateLogin, authController.login);
router.get('/me', auth.verifyToken, authController.getProfile);
router.put('/me', auth.verifyToken, authController.updateProfile);

module.exports = router;
