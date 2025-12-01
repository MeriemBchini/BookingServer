import { createBooking } from "../services/booking.service.js";
import Booking from "../models/booking.model.js";

// Create a new booking
export async function bookApartment(req, res) {
  try {
    const { apartmentId, startDate, endDate } = req.body;

    if (!apartmentId || !startDate || !endDate) {
      return res.status(400).json({
        message: "apartmentId, startDate and endDate are required",
      });
    }

    const booking = await createBooking(apartmentId, startDate, endDate);

    if (!booking) {
      return res.status(409).json({ message: "Apartment not available" });
    }

    res.json({ message: "Booking successful", booking });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating booking" });
  }
}

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve bookings" });
  }
};
