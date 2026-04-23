import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const startSendOtpConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD,
        });
        const channel = await connection.createChannel();
        const queueName = "send-otp";
        await channel.assertQueue(queueName, { durable: true });
        console.log("✅ mail service started, listening for otp emails");
        channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    const { to, subject, body } = JSON.parse(msg.content.toString());
                    const trasnporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        auth: {
                            user: process.env.SMTP_USER,
                            pass: process.env.SMTP_PASSWORD,
                        },
                    });
                    await trasnporter.sendMail({
                        from: "chat app",
                        to,
                        subject,
                        text: body,
                    });
                    console.log(`✅ otp email sent successfully to ${to}`);
                    channel.ack(msg);
                }
                catch (error) {
                    console.log("Failed to send otp error", error);
                    channel.nack(msg);
                }
            }
        });
    }
    catch (error) {
        console.log("Send otp error", error);
    }
};
//# sourceMappingURL=consumer.js.map