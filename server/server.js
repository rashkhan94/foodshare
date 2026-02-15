require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Initialize Express
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL // Add your Vercel URL here in production
].filter(Boolean);

// Socket.IO
const io = new Server(server, {
    cors: {
        origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
        methods: ['GET', 'POST']
    }
});
app.set('io', io);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: allowedOrigins.length > 0 ? allowedOrigins : '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Temporary Seed Endpoint
app.get('/api/seed-db', async (req, res) => {
    try {
        const seed = require('./seeds/seed');
        await seed();
        res.send('✅ Database seeded successfully! You can now login with demo accounts.');
    } catch (error) {
        res.status(500).send('❌ Error: ' + error.message);
    }
});

// Socket handlers
require('./socket')(io);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 FoodShare API running on http://localhost:${PORT}`);
    console.log(`💡 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔄 Restarting...`);
    console.log(`📡 Socket.IO ready`);
    console.log(`📁 Uploads directory: ${uploadsDir}\n`);
});
