import mongoose from "mongoose";
import dns from "dns";

// Fix for Node.js DNS SRV lookup failure (querySrv ECONNREFUSED) on Windows networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn("Could not set custom DNS servers:", e.message);
}

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => console.log("Database connected successfully"));
    mongoose.connection.on('error', (err) => console.log("MongoDB connection error:", err.message));

    await mongoose.connect(`${process.env.MONGODB_URI}/prescripto`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

export default connectDB;