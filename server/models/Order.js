const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'picked_up', 'completed', 'cancelled'],
        default: 'pending'
    },
    quantity: { type: Number, required: true, min: 1 },
    pickupTime: { type: Date },
    notes: { type: String, default: '' },
    totalPrice: { type: Number, default: 0 },
    completedAt: { type: Date }
}, { timestamps: true });

orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ donor: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
