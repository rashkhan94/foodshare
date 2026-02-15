const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createOrder);
router.get('/my', auth, getMyOrders);
router.put('/:id/status', auth, updateOrderStatus);

module.exports = router;
