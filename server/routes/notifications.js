const express = require('express');
const router = express.Router();
const { getNotifications, markAllRead, markRead } = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getNotifications);
router.put('/read', auth, markAllRead);
router.put('/:id/read', auth, markRead);

module.exports = router;
