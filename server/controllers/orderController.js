const Order = require('../models/Order');
const FoodListing = require('../models/FoodListing');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createOrder = async (req, res) => {
    try {
        const { listingId, quantity, pickupTime, notes } = req.body;

        const listing = await FoodListing.findById(listingId).populate('donor', 'name');
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        if (listing.status !== 'available') return res.status(400).json({ message: 'Listing is not available' });
        if (listing.donor.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot order your own listing' });
        }

        const order = await Order.create({
            listing: listingId,
            buyer: req.user._id,
            donor: listing.donor._id || listing.donor,
            quantity: parseInt(quantity) || 1,
            pickupTime: pickupTime ? new Date(pickupTime) : null,
            notes: notes || '',
            totalPrice: listing.type === 'sale' ? listing.price * (parseInt(quantity) || 1) : 0
        });

        await FoodListing.findByIdAndUpdate(listingId, {
            status: 'reserved',
            $inc: { orderCount: 1 }
        });

        // Create notification for donor
        const notification = await Notification.create({
            user: listing.donor._id || listing.donor,
            type: 'new_order',
            title: 'New Pickup Request!',
            message: `${req.user.name} requested to pick up "${listing.title}"`,
            link: `/orders`,
            relatedId: order._id
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`user_${listing.donor._id || listing.donor}`).emit('notification', notification);
            io.emit('listing-update', { ...listing.toObject(), status: 'reserved' });
        }

        const populated = await Order.findById(order._id)
            .populate('listing', 'title images type price')
            .populate('buyer', 'name avatar')
            .populate('donor', 'name avatar');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const { role } = req.query;
        const filter = role === 'donor'
            ? { donor: req.user._id }
            : { buyer: req.user._id };

        const orders = await Order.find(filter)
            .populate('listing', 'title images type price address')
            .populate('buyer', 'name avatar phone')
            .populate('donor', 'name avatar phone')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const isParticipant = [order.buyer.toString(), order.donor.toString()].includes(req.user._id.toString());
        if (!isParticipant && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        order.status = status;
        if (status === 'completed') {
            order.completedAt = new Date();
            await FoodListing.findByIdAndUpdate(order.listing, { status: 'completed' });
            await User.findByIdAndUpdate(order.donor, { $inc: { totalMealsSaved: order.quantity } });
        }
        if (status === 'cancelled') {
            await FoodListing.findByIdAndUpdate(order.listing, { status: 'available' });
        }
        await order.save();

        const notifyUser = order.donor.toString() === req.user._id.toString() ? order.buyer : order.donor;
        const notification = await Notification.create({
            user: notifyUser,
            type: 'order_update',
            title: 'Order Updated',
            message: `Your order status has been updated to "${status}"`,
            link: `/orders`,
            relatedId: order._id
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`user_${notifyUser}`).emit('notification', notification);
            io.to(`user_${notifyUser}`).emit('order-update', order);
        }

        const populated = await Order.findById(order._id)
            .populate('listing', 'title images type price')
            .populate('buyer', 'name avatar')
            .populate('donor', 'name avatar');

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
