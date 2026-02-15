const express = require('express');
const router = express.Router();
const { getDashboardStats, getImpact } = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

router.get('/dashboard', auth, getDashboardStats);
router.get('/impact', getImpact);

module.exports = router;
