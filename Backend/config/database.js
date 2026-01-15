const { MongoClient } = require('mongodb');
require('dotenv').config();

let db;
let client;

const connectDB = async () => {
  try {
    client = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    db = client.db(process.env.DB_NAME || 'event_management');
    console.log('✅ Connected to MongoDB successfully');
    
    // Create indexes
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    // Events collection indexes
    await db.collection('events').createIndex({ date: 1 });
    await db.collection('events').createIndex({ created_by: 1 });
    
    // RSVPs collection indexes
    await db.collection('rsvps').createIndex({ user_id: 1, event_id: 1 }, { unique: true });
    await db.collection('rsvps').createIndex({ event_id: 1 });
    await db.collection('rsvps').createIndex({ user_id: 1 });
    
    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
};

// Test connection
const testConnection = async () => {
  try {
    const db = getDB();
    const result = await db.command({ ping: 1 });
    console.log('✅ MongoDB connection test successful');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error.message);
    return false;
  }
};

module.exports = {
  connectDB,
  getDB,
  closeDB,
  testConnection
};