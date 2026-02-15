const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' }
}, { timestamps: true });

reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ reviewer: 1, reviewee: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
