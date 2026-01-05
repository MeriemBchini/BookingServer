import amqp from "amqplib";
import Apartment from "../models/apartment.model.js";

const RABBITMQ_URL = "amqp://rabbitmq:5672";

// Existing queue name to consume 
const EXISTING_QUEUE = "booking.apartment.change";

export async function startApartmentConsumer() {
  try {
    // 1️ Connect to RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // 2️ Avoid overwhelming the consumer
    channel.prefetch(1);

    console.log(` Apartment Consumer started`);
    console.log(` Consuming EXISTING queue: ${EXISTING_QUEUE}`);

    // 3️ Consume ONLY (no assert, no bind, no exchange)
    channel.consume(
      EXISTING_QUEUE,
      async (msg) => {
        if (!msg) return;

        // 🔍 DEBUG: see raw message
        console.log(" RAW MESSAGE:", msg.content.toString());

        try {
          // 4️ Parse message
          const rawMessage = JSON.parse(msg.content.toString());

          // 5️ Unwrap the nested apartment object
          const raw = rawMessage.apartment;

          // 6️ Map fields safely (PascalCase → camelCase)
          const apartment = {
            id: raw.id ?? raw.Id,
            name: raw.name ?? raw.Name,
            address: raw.address ?? raw.Address,
            description: raw.description ?? raw.Description,
            floor: raw.floor ?? raw.Floor,
            noiseLevel: raw.noiseLevel ?? raw.NoiseLevel,
            distanceToCenterInKm:
              raw.distanceToCenterInKm ?? raw.DistanceToCenterInKm,
            isVisible: raw.isVisible ?? raw.IsVisible,
            areaInSquareMeters:
              raw.areaInSquareMeters ?? raw.AreaInSquareMeters,
            isFurnished: raw.isFurnished ?? raw.IsFurnished,
            pricePerDay: raw.pricePerDay ?? raw.PricePerDay,
          };

          // 7️ Safety check
          if (!apartment.id) throw new Error("Apartment ID is missing");

          // 8️ Upsert into MongoDB
          await Apartment.findOneAndUpdate(
            { id: apartment.id },
            { ...apartment, lastSynced: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          console.log(" Apartment saved:", apartment.id);

          // 5️ ACK only after DB success
          channel.ack(msg);
        } catch (error) {
          console.error(" Failed to process apartment message:", error);

          // Requeue message
          channel.nack(msg, false, true);
        }
      },
      { noAck: false }
    );

  } catch (error) {
    console.error(" RabbitMQ connection failed. Retrying in 5s...");
    setTimeout(startApartmentConsumer, 5000);
  }
}
