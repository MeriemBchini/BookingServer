import amqp from "amqplib";
import Apartment from "../models/apartment.model.js";

const RABBITMQ_URL = "amqp://rabbitmq:5672";

// Existing queue name to consume from
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

        try {
          const apartment = JSON.parse(msg.content.toString());

          console.log(" Received apartment:", apartment.name);

          // 4️ UPSERT apartment
          await Apartment.findOneAndUpdate(
            {
              name: apartment.name,
              address: apartment.address
            },
            {
              description: apartment.description,
              floor: apartment.floor,
              noiseLevel: apartment.noiseLevel,
              distanceToCenterInKm: apartment.distanceToCenterInKm,
              isVisible: apartment.isVisible,
              areaInSquareMeters: apartment.areaInSquareMeters,
              isFurnished: apartment.isFurnished,
              pricePerDay: apartment.pricePerDay,
              lastSynced: new Date()
            },
            {
              upsert: true,
              new: true
            }
          );

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
