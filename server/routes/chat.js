const express = require('express');
const router = express.Router();
const { getMyChats, getChatMessages, startChat } = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getMyChats);
router.get('/:id', auth, getChatMessages);
router.post('/', auth, startChat);

module.exports = router;
