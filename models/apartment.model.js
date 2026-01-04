import mongoose from "mongoose";

const apartmentSchema = new mongoose.Schema({
  id: String,
  name: String,
  address: String,
  description: String,
  floor: Number,
  noiseLevel: Number,
  distanceToCenterInKm: Number,
  isVisible: Boolean,
  areaInSquareMeters: Number,
  isFurnished: Boolean,
  pricePerDay: Number,
}, { timestamps: true });

export default mongoose.model("Apartment", apartmentSchema);
