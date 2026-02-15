const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, getUserById, getAllUsers } = require('../controllers/authController');
const { auth, roleGuard } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.get('/users', auth, roleGuard('admin'), getAllUsers);
router.get('/user/:id', auth, getUserById);

module.exports = router;
