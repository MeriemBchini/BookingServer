import express from "express";
import {
  bookApartment,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/", bookApartment);
router.get("/", getAllBookings);
router.get("/:id", getBookingById);   
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

export default router;
