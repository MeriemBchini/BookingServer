import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";

const EXCHANGE_NAME = "Booking.change"; 
const QUEUE_NAME = "booking.search.queue";

export async function setupExchangeAndQueue() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // 1️ Create a fanout exchange
    await channel.assertExchange(EXCHANGE_NAME, "fanout", { durable: true });

    // 2️ Create queue
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // 3️ Bind queue to exchange WITHOUT routing key
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, "");

    console.log(` Exchange and queue setup complete`);
    console.log(`Exchange: ${EXCHANGE_NAME}`);
    console.log(`Queue: ${QUEUE_NAME}`);
    console.log(`Routing key: (none, fanout exchange)`);

    await channel.close();
    await connection.close();
  } catch (err) {
    console.error("Failed to setup exchange/queue:", err);
  }
}

setupExchangeAndQueue();
