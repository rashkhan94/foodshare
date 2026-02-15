const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    category: {
        type: String,
        enum: ['meals', 'groceries', 'bakery', 'produce', 'dairy', 'beverages', 'other'],
        required: true
    },
    type: { type: String, enum: ['donation', 'sale'], required: true },
    price: { type: Number, default: 0 },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, default: 'servings' },
    expiresAt: { type: Date, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    address: { type: String, required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['available', 'reserved', 'completed', 'expired'],
        default: 'available'
    },
    tags: [{ type: String }],
    dietaryInfo: [{ type: String, enum: ['vegetarian', 'vegan', 'halal', 'kosher', 'gluten-free', 'nut-free'] }],
    pickupInstructions: { type: String, default: '' },
    pickupTimeStart: { type: String, default: '' },
    pickupTimeEnd: { type: String, default: '' },
    viewCount: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 }
}, { timestamps: true });

foodListingSchema.index({ location: '2dsphere' });
foodListingSchema.index({ status: 1, type: 1, category: 1 });
foodListingSchema.index({ expiresAt: 1 });
foodListingSchema.index({ donor: 1 });

module.exports = mongoose.model('FoodListing', foodListingSchema);
