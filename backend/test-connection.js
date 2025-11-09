const mongoose = require('mongoose');

const MONGO_URI = "mongodb://localhost:27017/Save2Serve";

console.log("🔌 Attempting to connect to MongoDB...");
console.log(`Connection string: ${MONGO_URI}`);

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Successfully connected to MongoDB!");
    
    // Create a test document
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ 
      message: "Test document", 
      timestamp: new Date() 
    });
    console.log("✅ Test document inserted!");
    
    // List all databases
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log("\n📊 Available databases:");
    dbs.databases.forEach(db => {
      console.log(`   - ${db.name}`);
    });
    
    // List collections in Save2Serve
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\n📁 Collections in Save2Serve:");
    if (collections.length === 0) {
      console.log("   (No collections yet)");
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    console.log("\n✅ MongoDB is working correctly!");
    console.log("💡 Now you can:");
    console.log("   1. Open MongoDB Compass");
    console.log("   2. Connect to: mongodb://localhost:27017");
    console.log("   3. You should see the 'Save2Serve' database");
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:");
    console.error(err.message);
    console.log("\n💡 Troubleshooting:");
    console.log("   1. Is MongoDB installed and running?");
    console.log("   2. Try: net start MongoDB");
    console.log("   3. Or start Docker: docker compose up");
    process.exit(1);
  });
