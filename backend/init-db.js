const mongoose = require('mongoose');
const User = require('./Models/User');

// MongoDB connection string for local setup
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Save2Serve";

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB successfully!");

    // Check if database exists and show collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\n📊 Current collections in Save2Serve database:");
    if (collections.length === 0) {
      console.log("   (No collections yet - will be created automatically)");
    } else {
      collections.forEach(col => console.log(`   - ${col.name}`));
    }

    // Create indexes for User model
    console.log("\n🔧 Creating indexes...");
    await User.createIndexes();
    console.log("✅ User model indexes created successfully!");

    // Get database stats
    const stats = await mongoose.connection.db.stats();
    console.log("\n📈 Database Statistics:");
    console.log(`   Database Name: ${stats.db}`);
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Documents: ${stats.objects}`);
    console.log(`   Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);

    console.log("\n✅ Database initialization complete!");
    console.log("\n💡 Next steps:");
    console.log("   1. Start your backend server: npm start");
    console.log("   2. Register users via your frontend at http://localhost:3000");
    console.log("   3. View data in MongoDB Compass at mongodb://localhost:27017");

  } catch (error) {
    console.error("❌ Error initializing database:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed.");
  }
}

// Run initialization
initializeDatabase();
