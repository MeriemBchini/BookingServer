import { createBooking } from "../services/booking.service.js";
import Booking from "../models/booking.model.js";
import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const EXCHANGE_NAME = "Booking.change";

// Create a new booking and send to RabbitMQ
export async function bookApartment(req, res) {
  try {
    const { apartmentId, startDate, endDate } = req.body;

    if (!apartmentId || !startDate || !endDate) {
      return res.status(400).json({
        message: "apartmentId, startDate and endDate are required",
      });
    }

    // 1️⃣ Save booking to database
    const booking = await createBooking(apartmentId, startDate, endDate);

    if (!booking) {
      return res.status(409).json({ message: "Apartment not available" });
    }

    // 2️⃣ Send booking info to RabbitMQ
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createConfirmChannel(); // confirm channel
      await channel.assertExchange(EXCHANGE_NAME, "fanout", { durable: true });

      channel.publish(
        EXCHANGE_NAME,
        "",
        Buffer.from(JSON.stringify(booking)),
        { persistent: true }
      );

      await channel.waitForConfirms(); // ensures message is sent
      console.log(" [x] Sent booking update to RabbitMQ");

      await channel.close();
      await connection.close();
    } catch (mqError) {
      console.error("RabbitMQ error:", mqError);
      // optional: continue even if RabbitMQ fails
    }

    // ✅ Respond to client
    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating booking" });
  }
}

// Get all bookings
export async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve bookings" });
  }
}
