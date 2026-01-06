import { createBooking } from "../services/booking.service.js";
import Booking from "../models/booking.model.js";
import Apartment from "../models/apartment.model.js";
import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const EXCHANGE_NAME = "Booking.change";

/* ---------------- CREATE ---------------- */
export async function bookApartment(req, res) {
  try {
    const { apartmentId, startDate, endDate } = req.body;

    if (!apartmentId || !startDate || !endDate) {
      return res.status(400).json({
        message: "apartmentId, startDate and endDate are required",
      });
    }

    const apartment = await Apartment.findOne({ id: apartmentId });
    if (!apartment) {
      return res.status(404).json({
        message: "Apartment not found or not synced yet",
      });
    }

    const booking = await createBooking(apartmentId, startDate, endDate);
    if (!booking) {
      return res.status(409).json({ message: "Apartment not available" });
    }

    await publishEvent("BOOKING_CREATED", booking);

    res.status(201).json({
      message: "Booking successful",
      booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating booking" });
  }
}

/* ---------------- UPDATE ---------------- */
export async function updateBooking(req, res) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "startDate and endDate are required",
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // availability check (exclude current booking)
    const conflict = await Booking.findOne({
      apartmentId: booking.apartmentId,
      _id: { $ne: id },
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    });

    if (conflict) {
      return res.status(409).json({
        message: "Apartment not available for these dates",
      });
    }

    booking.startDate = startDate;
    booking.endDate = endDate;
    await booking.save();

    await publishEvent("BOOKING_UPDATED", booking);

    res.status(200).json({
      message: "Booking updated",
      booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating booking" });
  }
}

/* ---------------- DELETE ---------------- */
export async function deleteBooking(req, res) {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    await publishEvent("BOOKING_DELETED", booking);

    res.status(200).json({
      message: "Booking deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting booking" });
  }
}

/* ---------------- GET ---------------- */
export async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve bookings" });
  }
}
// Get booking by ID
export async function getBookingById(req, res) {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error retrieving booking",
    });
  }
}


/* ---------------- RABBITMQ HELPER ---------------- */
async function publishEvent(eventType, booking) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createConfirmChannel();
    await channel.assertExchange(EXCHANGE_NAME, "fanout", { durable: true });

    channel.publish(
      EXCHANGE_NAME,
      "",
      Buffer.from(
        JSON.stringify({
          event: eventType,
          bookingId: booking._id,
          apartmentId: booking.apartmentId,
          startDate: booking.startDate,
          endDate: booking.endDate,
        })
      ),
      { persistent: true }
    );

    await channel.waitForConfirms();
    await channel.close();
    await connection.close();

    console.log(` Event sent: ${eventType}`);
  } catch (err) {
    console.error("RabbitMQ publish error:", err);
  }
}
