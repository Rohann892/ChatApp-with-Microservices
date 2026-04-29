import { Server, Socket } from "socket.io";
import { createServer, METHODS } from "http";
import express from "express";

const app = express();

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const userSocketMap: Record<string, string> = {};

export const getReceiverSocketMap = (
  recieverId: string,
): string | undefined => {
  return userSocketMap[recieverId];
};

io.on("connection", (socket: Socket) => {
  console.log("user connected", socket.id);

  const userId = socket.handshake.query.userId as string | undefined;

  if (userId && userId !== undefined) {
    userSocketMap[userId] = socket.id;
    console.log(`user ${userId} mapped to ${socket.id}`);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  if (userId) {
    socket.join(userId);
  }

  socket.on("typing", (data) => {
    console.log(`user ${data.userId} is typing`);
    socket.to(data.chatId).emit("userTyping", {
      userId: data.userId,
      chatId: data.chatId,
    });
  });

  socket.on("stopTyping", (data) => {
    console.log(`user ${data.userId} stopped typing in the chat`);
    socket.to(data.chatId).emit("userStoppedTyping", {
      userId: data.userId,
      chatId: data.chatId,
    });
  });

  socket.on("join", (chatId) => {
    socket.join(chatId);
    console.log(`User ${userId} joined the chat room ${chatId}`);
  });

  socket.on("leaveChat", (chatId) => {
    socket.leave(chatId);
    console.log(`User ${userId} left the chat room ${chatId}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      console.log(`user ${userId} removed from online users`);
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

  socket.on("error", (error) => {
    console.log("socket connection error", error);
  });
});
export { app, server, io };
