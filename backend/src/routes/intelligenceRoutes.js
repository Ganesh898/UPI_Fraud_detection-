const express = require('express');
const auth = require('../middleware/auth');
const intelligenceController = require('../controllers/intelligenceController');

const router = express.Router();

router.use(auth.verifyToken);
router.get('/jobs', intelligenceController.list);
router.post('/submissions', intelligenceController.submit);
router.get('/jobs/:id', intelligenceController.get);

module.exports = router;
