import amqp, { type Channel, type ChannelModel } from "amqplib";

let channel: Channel;
let connection: ChannelModel;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect({
      protocol: "amqp", // ✅ fixed typo (was "ampq")
      hostname: process.env.RABBITMQ_HOST,
      port: 5672,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    });

    channel = await connection.createChannel();
    console.log("✅ Connected to RabbitMQ");
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ", error);
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.log("RabbitMQ is not inatalized");
    return;
  }

  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });

  console.log(`Message sent to queue: ${queueName}`);
};
