import { connectRabbitMQ } from "./connection.js";

const EXCHANGE_NAME = "topic_exchange";

export const startConsumer = async (bindingKey) => {
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
    (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());

        console.log(`📩 Received [${msg.fields.routingKey}]:`, data);

        channel.ack(msg);
      }
    },
    { noAck: false }
  );
};
