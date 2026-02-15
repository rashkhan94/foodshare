const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Order = require('../models/Order');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalListings = await FoodListing.countDocuments();
        const activeListings = await FoodListing.countDocuments({ status: 'available', expiresAt: { $gt: new Date() } });
        const totalOrders = await Order.countDocuments();
        const completedOrders = await Order.countDocuments({ status: 'completed' });
        const totalDonations = await FoodListing.countDocuments({ type: 'donation' });
        const totalSales = await FoodListing.countDocuments({ type: 'sale' });

        // Meals saved (sum of completed order quantities)
        const mealsSavedAgg = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);
        const totalMealsSaved = mealsSavedAgg[0]?.total || 0;

        // CO2 saved (approx 2.5kg per meal saved from waste)
        const co2Saved = Math.round(totalMealsSaved * 2.5);

        // Category breakdown
        const categoryBreakdown = await FoodListing.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Weekly trends (last 7 days)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weeklyListings = await FoodListing.aggregate([
            { $match: { createdAt: { $gte: weekAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    donations: { $sum: { $cond: [{ $eq: ['$type', 'donation'] }, 1, 0] } },
                    sales: { $sum: { $cond: [{ $eq: ['$type', 'sale'] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Recent activity
        const recentOrders = await Order.find()
            .populate('listing', 'title type')
            .populate('buyer', 'name avatar')
            .populate('donor', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(10);

        // Top donors
        const topDonors = await User.find({ totalDonations: { $gt: 0 } })
            .select('name avatar totalDonations totalMealsSaved rating')
            .sort({ totalDonations: -1 })
            .limit(5);

        res.json({
            stats: {
                totalUsers, totalListings, activeListings, totalOrders,
                completedOrders, totalDonations, totalSales, totalMealsSaved, co2Saved
            },
            categoryBreakdown,
            weeklyListings,
            recentOrders,
            topDonors
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getImpact = async (req, res) => {
    try {
        const mealsSavedAgg = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);
        const totalMealsSaved = mealsSavedAgg[0]?.total || 0;
        const co2Saved = Math.round(totalMealsSaved * 2.5);
        const waterSaved = Math.round(totalMealsSaved * 100); // liters
        const totalDonors = await User.countDocuments({ totalDonations: { $gt: 0 } });

        // Monthly impact trend
        const monthlyImpact = await Order.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$completedAt' } },
                    meals: { $sum: '$quantity' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 12 }
        ]);

        res.json({
            totalMealsSaved, co2Saved, waterSaved, totalDonors, monthlyImpact
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
