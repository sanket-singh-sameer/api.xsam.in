// publisher.js
import { connectRabbitMQ } from "./connection.js";

const EXCHANGE_NAME = "topic_exchange";

export const publishMessage = async (routingKey, message) => {
  const { channel } = await connectRabbitMQ();

  await channel.assertExchange(EXCHANGE_NAME, "topic", {
    durable: true,
  });

  const msgBuffer = Buffer.from(JSON.stringify(message));

  channel.publish(EXCHANGE_NAME, routingKey, msgBuffer);

  console.log(`📤 Sent: ${routingKey}`, message);
};
