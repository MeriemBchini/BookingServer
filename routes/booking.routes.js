import express from "express";
import { bookApartment, getAllBookings } from "../controllers/booking.controller.js";

const router = express.Router();

// Create a booking
router.post("/", bookApartment);

// Get all bookings
router.get("/", getAllBookings);

export default router;