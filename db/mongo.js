import mongoose from "mongoose";

export async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB connected");
  } catch (err) {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  }
}
