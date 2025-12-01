import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  apartmentId: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

export default mongoose.model("Booking", bookingSchema);
