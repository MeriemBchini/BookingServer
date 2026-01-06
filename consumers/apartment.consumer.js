import amqp from "amqplib";
import Apartment from "../models/apartment.model.js";

const RABBITMQ_URL = "amqp://rabbitmq:5672";
const EXISTING_QUEUE = "booking.apartment.change";

export async function startApartmentConsumer() {
  try {
    // 1️ Connect to RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // 2️ Avoid overwhelming MongoDB
    channel.prefetch(1);

    console.log(" Apartment Consumer started");
    console.log(` Consuming queue: ${EXISTING_QUEUE}`);

    channel.consume(
      EXISTING_QUEUE,
      async (msg) => {
        if (!msg) return;

        console.log(" RAW MESSAGE:", msg.content.toString());

        try {
          // 3️ Parse message
          const message = JSON.parse(msg.content.toString());

          // 4️ Extract apartment payload
          const raw = message.apartment;

          if (!raw) {
            throw new Error("Apartment payload is missing");
          }

          // 5️ Determine action (Option A fix)
          const action = (
            message.action ||
            message.apartmentChange ||
            (raw.IsDeleted ? "DELETE" : "UPDATE")
          ).toUpperCase();

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

          if (!apartment.id) {
            throw new Error("Apartment ID is missing");
          }

          // 7️ Handle action
          switch (action) {
            case "CREATE":
            case "UPDATE":
              await Apartment.findOneAndUpdate(
                { id: apartment.id },
                {
                  ...apartment,
                  isDeleted: false,
                  lastSynced: new Date(),
                },
                { upsert: true, new: true }
              );
              console.log(` Apartment ${action}:`, apartment.id);
              break;

            case "DELETE":
              await Apartment.deleteOne({ id: apartment.id });
              console.log(" Apartment deleted:", apartment.id);
              break;

            default:
              throw new Error(`Unknown apartment action: ${action}`);
          }

          // 8️ ACK after success
          channel.ack(msg);
        } catch (error) {
          console.error(" Failed to process apartment message:", error.message);

          // 9️ Requeue message
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
