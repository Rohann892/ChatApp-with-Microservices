import express from "express";
import dotenv from "dotenv";
import connectToDB from "./config/db.js";
import chatRoute from "./routes/chat.js";
import cors from "cors";
dotenv.config();
connectToDB();
const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use("/api/v1/chat", chatRoute);
app.listen(port, () => {
    console.log(`Server started at ${port}`);
});
//# sourceMappingURL=index.js.map