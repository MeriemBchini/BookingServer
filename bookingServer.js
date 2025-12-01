import express from "express";
import bodyParser from "body-parser";
import { connectDB } from "./db/mongo.js";
import apartmentRoutes from "./routes/apartment.routes.js";
import bookingRoutes from "./routes/booking.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/apartments", apartmentRoutes);
app.use("/bookings", bookingRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Booking service is running on port ${PORT}`);
});
