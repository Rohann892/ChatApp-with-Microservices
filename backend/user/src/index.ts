import express from "express";
import dotenv from "dotenv";
import connectToDB from "./config/db.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";

dotenv.config();

connectToDB();
connectRabbitMQ();

export const redisClient = createClient({
  url: process.env.REDIS_URL as string,
});

redisClient
  .connect()
  .then(() => console.log("connected to redis"))
  .catch(console.error);

const app = express();

app.use(express.json());

app.use("/api/v1", userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
