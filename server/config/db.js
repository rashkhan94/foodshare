const mongoose = require('mongoose');

const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Main MongoDB not available: ${error.message}`);
    console.log('🔄 Attempting to start in-memory MongoDB fallback...');

    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Connected: ${uri}`);
      console.log('📝 Note: Data will be lost when the server restarts.');

      // Seed data since it's a fresh DB
      const seed = require('../seeds/seed');
      console.log('🌱 Seeding in-memory database...');
      await seed();
      console.log('✨ Database seeded successfully!');
    } catch (memError) {
      console.error(`❌ In-Memory DB failed: ${memError.message}`);
      console.warn('  Server will run but database features won\'t work.');
    }
  }
};

module.exports = connectDB;
