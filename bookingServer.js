import express from "express";
import bodyParser from "body-parser";
import { connectDB } from "./db/mongo.js";
import apartmentRoutes from "./routes/apartment.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import { llmGenerate } from "./llm/ollama.client.js";

import { startApartmentConsumer } from "./consumers/apartment.consumer.js";
import { setupExchangeAndQueue } from "./exchangers/booking.exchange.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/apartments", apartmentRoutes);
app.use("/bookings", bookingRoutes);
// Test LLM endpoint
app.get("/test/llm", async (req, res) => {
  const response = await llmGenerate("Say hello in one short sentence.");
  res.json({ llmResponse: response });
});

// Start RabbitMQ consumer
startApartmentConsumer();

// Start RabbitMQ exchanger
setupExchangeAndQueue();

// Start server
app.listen(PORT, () => {
    console.log(`Booking service is running on port ${PORT}`);
});
