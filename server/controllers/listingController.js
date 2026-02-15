const FoodListing = require('../models/FoodListing');
const User = require('../models/User');

exports.createListing = async (req, res) => {
    try {
        const { title, description, category, type, price, quantity, unit, expiresAt,
            latitude, longitude, address, tags, dietaryInfo, pickupInstructions,
            pickupTimeStart, pickupTimeEnd } = req.body;

        const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

        const listing = await FoodListing.create({
            title, description, images, category, type,
            price: type === 'donation' ? 0 : (parseFloat(price) || 0),
            quantity: parseInt(quantity) || 1,
            unit: unit || 'servings',
            expiresAt: new Date(expiresAt),
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            address,
            donor: req.user._id,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            dietaryInfo: dietaryInfo ? (Array.isArray(dietaryInfo) ? dietaryInfo : dietaryInfo.split(',').map(d => d.trim())) : [],
            pickupInstructions: pickupInstructions || '',
            pickupTimeStart: pickupTimeStart || '',
            pickupTimeEnd: pickupTimeEnd || ''
        });

        await User.findByIdAndUpdate(req.user._id, { $inc: { totalDonations: 1 } });

        const populated = await FoodListing.findById(listing._id).populate('donor', 'name avatar rating reviewCount');

        // Emit to socket
        const io = req.app.get('io');
        if (io) io.emit('new-listing', populated);

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getListings = async (req, res) => {
    try {
        const { type, category, status, search, sort, page = 1, limit = 12 } = req.query;
        const filter = {};

        if (type) filter.type = type;
        if (category) filter.category = category;
        filter.status = status || 'available';
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Don't show expired listings
        filter.expiresAt = { $gt: new Date() };

        let sortOption = { createdAt: -1 };
        if (sort === 'price_low') sortOption = { price: 1 };
        if (sort === 'price_high') sortOption = { price: -1 };
        if (sort === 'expiring') sortOption = { expiresAt: 1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const listings = await FoodListing.find(filter)
            .populate('donor', 'name avatar rating reviewCount')
            .sort(sortOption).skip(skip).limit(parseInt(limit));

        const total = await FoodListing.countDocuments(filter);

        res.json({
            listings, total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getNearbyListings = async (req, res) => {
    try {
        const { lat, lng, radius = 10, type, category } = req.query;
        if (!lat || !lng) return res.status(400).json({ message: 'Latitude and longitude required' });

        const filter = {
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseFloat(radius) * 1000 // km to meters
                }
            },
            status: 'available',
            expiresAt: { $gt: new Date() }
        };

        if (type) filter.type = type;
        if (category) filter.category = category;

        const listings = await FoodListing.find(filter)
            .populate('donor', 'name avatar rating reviewCount')
            .limit(50);

        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getListingById = async (req, res) => {
    try {
        const listing = await FoodListing.findByIdAndUpdate(
            req.params.id,
            { $inc: { viewCount: 1 } },
            { new: true }
        ).populate('donor', 'name avatar rating reviewCount bio phone totalDonations totalMealsSaved');

        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        res.json(listing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateListing = async (req, res) => {
    try {
        const listing = await FoodListing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        if (listing.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updates = req.body;
        if (updates.latitude && updates.longitude) {
            updates.location = {
                type: 'Point',
                coordinates: [parseFloat(updates.longitude), parseFloat(updates.latitude)]
            };
        }
        if (req.files && req.files.length > 0) {
            updates.images = [...(listing.images || []), ...req.files.map(f => `/uploads/${f.filename}`)];
        }

        const updated = await FoodListing.findByIdAndUpdate(req.params.id, updates, { new: true })
            .populate('donor', 'name avatar rating reviewCount');

        const io = req.app.get('io');
        if (io) io.emit('listing-update', updated);

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteListing = async (req, res) => {
    try {
        const listing = await FoodListing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        if (listing.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await FoodListing.findByIdAndDelete(req.params.id);
        res.json({ message: 'Listing deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyListings = async (req, res) => {
    try {
        const listings = await FoodListing.find({ donor: req.user._id })
            .sort({ createdAt: -1 })
            .populate('donor', 'name avatar');
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
