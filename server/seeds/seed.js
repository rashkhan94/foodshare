const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

const seed = async () => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB for seeding...');
        }

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            FoodListing.deleteMany({}),
            Order.deleteMany({}),
            Review.deleteMany({}),
            Notification.deleteMany({})
        ]);
        console.log('Cleared existing data');

        // Create users
        const users = await User.create([
            {
                name: 'Sarah Kitchen', email: 'sarah@foodshare.com', password: 'password123',
                role: 'donor', phone: '+1-555-0101', bio: 'Community kitchen owner passionate about reducing food waste.',
                address: '123 Main St, Downtown', totalDonations: 45, totalMealsSaved: 320, rating: 4.8, reviewCount: 23,
                location: { type: 'Point', coordinates: [-73.9857, 40.7484] }
            },
            {
                name: 'Fresh Bites Bakery', email: 'freshbites@foodshare.com', password: 'password123',
                role: 'donor', phone: '+1-555-0102', bio: 'Local bakery sharing surplus bread, pastries & cakes daily.',
                address: '456 Baker Ave, Midtown', totalDonations: 89, totalMealsSaved: 567, rating: 4.9, reviewCount: 56,
                location: { type: 'Point', coordinates: [-73.9712, 40.7614] }
            },
            {
                name: 'Green Grocers', email: 'green@foodshare.com', password: 'password123',
                role: 'donor', phone: '+1-555-0103', bio: 'Organic grocery store — we donate surplus produce every evening.',
                address: '789 Market St, Uptown', totalDonations: 67, totalMealsSaved: 445, rating: 4.7, reviewCount: 34,
                location: { type: 'Point', coordinates: [-73.9632, 40.7831] }
            },
            {
                name: 'Mike Johnson', email: 'mike@foodshare.com', password: 'password123',
                role: 'buyer', phone: '+1-555-0201', bio: 'College student looking for affordable meals.',
                address: '321 University Blvd', rating: 4.5, reviewCount: 8,
                location: { type: 'Point', coordinates: [-73.9903, 40.7359] }
            },
            {
                name: 'Hope Foundation', email: 'hope@foodshare.com', password: 'password123',
                role: 'ngo', phone: '+1-555-0301', bio: 'NGO dedicated to fighting hunger in underserved communities. We collect and distribute food to shelters.',
                address: '555 Charity Lane', totalDonations: 12, totalMealsSaved: 890, rating: 5.0, reviewCount: 45,
                location: { type: 'Point', coordinates: [-73.9778, 40.7528] }
            },
            {
                name: 'Admin FoodShare', email: 'admin@foodshare.com', password: 'password123',
                role: 'admin', phone: '+1-555-0001', bio: 'Platform administrator.',
                address: 'FoodShare HQ',
                location: { type: 'Point', coordinates: [-73.9855, 40.7580] }
            }
        ]);

        console.log(`Created ${users.length} users`);

        // Create food listings
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const twoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        const listings = await FoodListing.create([
            {
                title: 'Fresh Vegetable Curry & Rice', description: 'Homemade vegetable curry with basmati rice. Made today, enough for 8 people. Includes raita and naan bread. All organic ingredients.',
                category: 'meals', type: 'donation', price: 0, quantity: 8, unit: 'servings',
                expiresAt: tomorrow, address: '123 Main St, Downtown', donor: users[0]._id,
                location: { type: 'Point', coordinates: [-73.9857, 40.7484] },
                tags: ['curry', 'rice', 'vegetarian', 'homemade'], dietaryInfo: ['vegetarian'],
                pickupInstructions: 'Come to the back door. Ring the bell twice.', pickupTimeStart: '17:00', pickupTimeEnd: '20:00',
                viewCount: 124, orderCount: 3, status: 'available'
            },
            {
                title: 'Artisan Sourdough Bread (6 loaves)', description: 'Fresh-baked sourdough bread from this morning. Perfectly crusty outside, soft inside. Great for sandwiches or toast.',
                category: 'bakery', type: 'donation', price: 0, quantity: 6, unit: 'loaves',
                expiresAt: tomorrow, address: '456 Baker Ave, Midtown', donor: users[1]._id,
                location: { type: 'Point', coordinates: [-73.9712, 40.7614] },
                tags: ['bread', 'sourdough', 'artisan', 'fresh'], dietaryInfo: ['vegan'],
                pickupInstructions: 'Ask for Maria at the counter.', pickupTimeStart: '16:00', pickupTimeEnd: '19:00',
                viewCount: 89, orderCount: 2, status: 'available'
            },
            {
                title: 'Organic Fruit Box — Mixed Seasonal', description: 'Box of mixed seasonal organic fruits: apples, oranges, bananas, grapes. Slightly imperfect but perfectly delicious!',
                category: 'produce', type: 'sale', price: 5.99, quantity: 10, unit: 'boxes',
                expiresAt: twoDays, address: '789 Market St, Uptown', donor: users[2]._id,
                location: { type: 'Point', coordinates: [-73.9632, 40.7831] },
                tags: ['fruits', 'organic', 'seasonal', 'healthy'], dietaryInfo: ['vegan', 'gluten-free'],
                pickupInstructions: 'Available at the entrance display rack.', pickupTimeStart: '09:00', pickupTimeEnd: '21:00',
                viewCount: 203, orderCount: 5, status: 'available'
            },
            {
                title: 'Pasta Primavera Family Pack', description: 'Delicious pasta primavera with mixed vegetables, garlic bread, and Caesar salad. Feeds a family of 4-5.',
                category: 'meals', type: 'sale', price: 8.50, quantity: 4, unit: 'packs',
                expiresAt: tomorrow, address: '123 Main St, Downtown', donor: users[0]._id,
                location: { type: 'Point', coordinates: [-73.9857, 40.7484] },
                tags: ['pasta', 'italian', 'family', 'salad'], dietaryInfo: ['vegetarian'],
                pickupInstructions: 'Call when you arrive.', pickupTimeStart: '18:00', pickupTimeEnd: '21:00',
                viewCount: 67, orderCount: 1, status: 'available'
            },
            {
                title: 'Chocolate Croissants & Danish Pastry', description: 'Assorted pastries from today — 12 chocolate croissants and 8 danish pastries. Perfect for breakfast or snacks!',
                category: 'bakery', type: 'donation', price: 0, quantity: 20, unit: 'pieces',
                expiresAt: tomorrow, address: '456 Baker Ave, Midtown', donor: users[1]._id,
                location: { type: 'Point', coordinates: [-73.9712, 40.7614] },
                tags: ['pastry', 'chocolate', 'croissant', 'breakfast'], dietaryInfo: [],
                pickupInstructions: 'Available in the donation basket at the entrance.', pickupTimeStart: '15:00', pickupTimeEnd: '19:00',
                viewCount: 156, orderCount: 4, status: 'available'
            },
            {
                title: 'Fresh Dairy Bundle — Milk, Yogurt, Cheese', description: 'Near-expiry but perfectly good dairy products: 2L milk, 4 yogurts, and a block of cheddar cheese.',
                category: 'dairy', type: 'sale', price: 3.99, quantity: 15, unit: 'bundles',
                expiresAt: twoDays, address: '789 Market St, Uptown', donor: users[2]._id,
                location: { type: 'Point', coordinates: [-73.9632, 40.7831] },
                tags: ['dairy', 'milk', 'yogurt', 'cheese'], dietaryInfo: ['vegetarian'],
                pickupInstructions: 'Ask at dairy counter for discounted bundle.', pickupTimeStart: '09:00', pickupTimeEnd: '20:00',
                viewCount: 112, orderCount: 6, status: 'available'
            },
            {
                title: 'Grilled Chicken & Quinoa Bowls', description: 'Healthy grilled chicken bowls with quinoa, roasted vegetables, and tahini dressing. 6 portions available.',
                category: 'meals', type: 'sale', price: 6.00, quantity: 6, unit: 'bowls',
                expiresAt: tomorrow, address: '123 Main St, Downtown', donor: users[0]._id,
                location: { type: 'Point', coordinates: [-73.9857, 40.7484] },
                tags: ['chicken', 'quinoa', 'healthy', 'protein'], dietaryInfo: ['gluten-free'],
                pickupInstructions: 'Ready for pickup from 12pm.', pickupTimeStart: '12:00', pickupTimeEnd: '20:00',
                viewCount: 95, orderCount: 2, status: 'available'
            },
            {
                title: 'Surplus Sandwich Platter', description: 'Catering leftover — assorted sandwiches (ham, turkey, veggie, tuna). About 15 half-sandwiches.',
                category: 'meals', type: 'donation', price: 0, quantity: 15, unit: 'sandwiches',
                expiresAt: tomorrow, address: '555 Charity Lane', donor: users[4]._id,
                location: { type: 'Point', coordinates: [-73.9778, 40.7528] },
                tags: ['sandwiches', 'catering', 'mixed', 'lunch'], dietaryInfo: [],
                pickupInstructions: 'Reception desk, mention FoodShare.', pickupTimeStart: '14:00', pickupTimeEnd: '18:00',
                viewCount: 178, orderCount: 7, status: 'available'
            },
            {
                title: 'Vegan Smoothie Pack (Frozen)', description: 'Pre-portioned frozen smoothie packs: mango-banana, berry blast, green detox. Just blend and enjoy!',
                category: 'beverages', type: 'sale', price: 2.50, quantity: 20, unit: 'packs',
                expiresAt: threeDays, address: '789 Market St, Uptown', donor: users[2]._id,
                location: { type: 'Point', coordinates: [-73.9632, 40.7831] },
                tags: ['smoothie', 'frozen', 'vegan', 'healthy'], dietaryInfo: ['vegan', 'gluten-free'],
                pickupInstructions: 'Freezer section, labeled "FoodShare".', pickupTimeStart: '09:00', pickupTimeEnd: '21:00',
                viewCount: 88, orderCount: 3, status: 'available'
            },
            {
                title: 'Homemade Granola & Energy Bars', description: 'Freshly made granola (2kg) and 10 energy bars with oats, honey, nuts, and dried fruits. Perfect for snacking!',
                category: 'groceries', type: 'sale', price: 4.50, quantity: 12, unit: 'packs',
                expiresAt: threeDays, address: '456 Baker Ave, Midtown', donor: users[1]._id,
                location: { type: 'Point', coordinates: [-73.9712, 40.7614] },
                tags: ['granola', 'energy bars', 'snacks', 'healthy'], dietaryInfo: ['vegetarian'],
                pickupInstructions: 'Available at the health foods section.', pickupTimeStart: '10:00', pickupTimeEnd: '18:00',
                viewCount: 134, orderCount: 4, status: 'available'
            }
        ]);

        console.log(`Created ${listings.length} food listings`);

        // Create some orders
        const orders = await Order.create([
            {
                listing: listings[0]._id, buyer: users[3]._id, donor: users[0]._id,
                status: 'completed', quantity: 2, pickupTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
                notes: 'Will pick up at 6pm', totalPrice: 0, completedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
            },
            {
                listing: listings[2]._id, buyer: users[3]._id, donor: users[2]._id,
                status: 'accepted', quantity: 1, pickupTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
                notes: 'Looking forward to it!', totalPrice: 5.99
            },
            {
                listing: listings[4]._id, buyer: users[4]._id, donor: users[1]._id,
                status: 'completed', quantity: 10, pickupTime: new Date(now.getTime() - 4 * 60 * 60 * 1000),
                notes: 'For our shelter residents', totalPrice: 0, completedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000)
            }
        ]);

        console.log(`Created ${orders.length} orders`);

        // Create some reviews
        const reviews = await Review.create([
            {
                reviewer: users[3]._id, reviewee: users[0]._id, listing: listings[0]._id, order: orders[0]._id,
                rating: 5, comment: 'Amazing food! The curry was absolutely delicious and portions were generous. Thank you so much!'
            },
            {
                reviewer: users[4]._id, reviewee: users[1]._id, listing: listings[4]._id, order: orders[2]._id,
                rating: 5, comment: 'Fresh Bites Bakery is incredible! The pastries were fresh and our shelter residents loved them.'
            }
        ]);

        console.log(`Created ${reviews.length} reviews`);
        console.log('\n✅ Database seeded successfully!');

        // Return demo accounts if run as script, otherwise just return
        if (require.main === module) {
            process.exit(0);
        }
    } catch (error) {
        console.error('Seed error:', error);
        if (require.main === module) process.exit(1);
        throw error; // Re-throw if imported
    }
};

module.exports = seed;

// Only run if called directly
if (require.main === module) {
    if (mongoose.connection.readyState === 0) {
        mongoose.connect(process.env.MONGODB_URI)
            .then(() => seed())
            .catch(err => {
                console.error(err);
                process.exit(1);
            });
    } else {
        seed();
    }
}
