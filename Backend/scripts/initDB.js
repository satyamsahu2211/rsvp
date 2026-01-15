const { connectDB, getDB } = require('../config/database');

async function initializeDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await connectDB();
    const db = getDB();
    
    console.log('✅ Database connected successfully');
    
    // Collections will be created automatically when we insert documents
    console.log('🎉 MongoDB database initialization completed!');
    
    return db;
  } catch (error) {
    console.error('💥 Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database setup complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;