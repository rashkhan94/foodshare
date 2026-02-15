const Review = require('../models/Review');
const User = require('../models/User');

exports.createReview = async (req, res) => {
    try {
        const { revieweeId, listingId, orderId, rating, comment } = req.body;

        if (revieweeId === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot review yourself' });
        }

        const review = await Review.create({
            reviewer: req.user._id,
            reviewee: revieweeId,
            listing: listingId,
            order: orderId,
            rating: parseInt(rating),
            comment: comment || ''
        });

        // Update user's average rating
        const reviews = await Review.find({ reviewee: revieweeId });
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await User.findByIdAndUpdate(revieweeId, {
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: reviews.length
        });

        const populated = await Review.findById(review._id)
            .populate('reviewer', 'name avatar')
            .populate('listing', 'title');

        res.status(201).json(populated);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this order' });
        }
        res.status(500).json({ message: error.message });
    }
};

exports.getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ reviewee: req.params.id })
            .populate('reviewer', 'name avatar')
            .populate('listing', 'title')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
