import { connectRabbitMQ } from "../rabbitMQ/connection.js";
import { sendGMail } from "./sendGMail.js";

const EXCHANGE_NAME = "topic_exchange";

export const startMailConsumer = async (bindingKey) => {
  const { channel } = await connectRabbitMQ();

  await channel.assertExchange(EXCHANGE_NAME, "topic", {
    durable: true,
  });

  const q = await channel.assertQueue("", {
    exclusive: true,
  });

  await channel.bindQueue(q.queue, EXCHANGE_NAME, bindingKey);

  console.log(`📥 Waiting for messages with pattern: ${bindingKey}`);

  channel.consume(
    q.queue,
    async (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          await sendGMail(data);
          console.log(`📩 Received [${msg.fields.routingKey}]:`, data);
          channel.ack(msg);
        } catch (error) {
          console.error("❌ Failed to process mail message:", error.message);
          channel.nack(msg, false, false);
        }
      }
    },
    { noAck: false }
  );
};
