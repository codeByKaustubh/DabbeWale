const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔌 Attempting to connect to MongoDB...");
    console.log("📡 MongoDB URI:", process.env.MONGO_URI || "Not set - using default");
    
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/dabbewala";
    
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Connected Successfully!");
    console.log("📦 Connected to database:", mongoose.connection.name);
    console.log("🌐 MongoDB URL:", mongoose.connection.host + ":" + mongoose.connection.port);

  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.error("💡 Make sure MongoDB is running and MONGO_URI is set correctly");
    console.error("🔧 For local development, install MongoDB or use MongoDB Atlas");
    process.exit(1);
  }
};

module.exports = connectDB;