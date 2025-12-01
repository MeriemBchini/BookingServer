import mongoose from "mongoose";

export async function connectDB() {
  try {
    const mongoURL = process.env.MONGO_URL || "mongodb://localhost:27017";
    await mongoose.connect(mongoURL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
