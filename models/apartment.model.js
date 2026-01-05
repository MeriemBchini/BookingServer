import mongoose from "mongoose";

const apartmentSchema = new mongoose.Schema({
  id: { type: String, unique: true }, 
  name: String,
  address: String,
  description: String,
  floor: Number,
  noiseLevel: Number,
  distanceToCenterInKm: Number,
  isVisible: Boolean,
  areaInSquareMeters: Number,
  isFurnished: Boolean,
  pricePerDay: Number
}, { timestamps: true });

// Explicitly naming the collection 'apartments'
export default mongoose.model("Apartment", apartmentSchema, "apartments");