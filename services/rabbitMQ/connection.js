import amqp from "amqplib";

let connection = null;
let channel = null;

export const connectRabbitMQ = async () => {
  try {
    if (connection && channel) return { connection, channel };
    connection = await amqp.connect(process.env.RABBITMQ_URI);
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
    return { connection, channel };
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
    throw error;
  }
};
