import axios from "axios";
import TryCatch from "../config/TryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../model/chat.js";
import { Messages } from "../model/message.js";
import dotenv from "dotenv";
dotenv.config();

export const createNewChat = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      res.status(400).json({
        message: "other userId is required",
      });
      return;
    }
    const existingChat = await Chat.findOne({
      users: { $all: [userId, otherUserId], $size: 2 },
    });

    if (existingChat) {
      res.json({
        message: "chat already exists",
        chatId: existingChat?._id,
      });
      return;
    }

    const newChat = await Chat.create({
      users: [userId, otherUserId],
    });

    res.json({
      message: "chat created successfully",
      chatId: newChat._id,
    });
  },
);

export const getAllChats = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  if (!userId) {
    res.status(400).json({
      message: "userId is missing",
    });
    return;
  }

  const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });

  const chatsWithUserData = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.users.find((id) => id !== userId);

      const unseenCount = await Messages.countDocuments({
        chatId: chat._id,
        sender: { $ne: userId },
        seen: false,
      });

      try {
        const { data } = await axios.get(
          `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`,
        );

        return {
          user: data.user,
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenCount,
          },
        };
      } catch (error) {
        console.log(error);
        return {
          user: {
            _id: otherUserId,
            name: "Unknown",
          },
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenCount,
          },
        };
      }
    }),
  );

  res.status(200).json({
    success: true,
    chats: chatsWithUserData,
  });
  return;
});

export const sendMessage = TryCatch(async (req: AuthenticatedRequest, res) => {
  const senderId = req.user?._id;
  const { chatId, text } = req.body;
  const imageFile = req.file;

  if (!senderId) {
    res.status(401).json({
      message: "Unauthorized user",
    });
    return;
  }
  if (!chatId) {
    res.status(401).json({
      message: "Chat id required",
    });
    return;
  }

  if (!text && !imageFile) {
    res.status(401).json({
      message: "Either text or image is required",
    });
    return;
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(400).json({
      message: "chat not found",
    });
    return;
  }

  const userInChat = chat.users.some(
    (userID) => userID.toString() === senderId.toString(),
  );

  if (!userInChat) {
    res.status(400).json({
      message: "You are not a participant",
    });
    return;
  }

  const otherUserId = chat.users.find(
    (userId) => userId.toString() !== senderId.toString(),
  );

  if (!otherUserId) {
    res.status(401).json({
      message: "No other user",
    });
    return;
  }

  //   socket.io setup from here

  let messageData: any = {
    chatId: chatId,
    sender: senderId,
    seen: false,
    seenAt: undefined,
  };

  if (imageFile) {
    // multer-storage-cloudinary already uploaded the file;
    // req.file.path  → secure URL
    // req.file.filename → public_id
    messageData.image = {
      url: (imageFile as any).path,
      publicId: (imageFile as any).filename,
    };
    messageData.messageType = "image";
    messageData.text = text || "";
  } else {
    messageData.text = text;
    messageData.messageType = "text";
  }

  const message = new Messages(messageData);
  const savedMessage = await message.save();
  const latestMessageText = imageFile ? "📸" : text;

  await Chat.findByIdAndUpdate(
    chatId,
    {
      latestMessage: {
        latestMessage: latestMessageText,
        sender: senderId,
      },
      updatedAt: new Date(),
    },
    { new: true },
  );

  //   emit to socket

  res.status(201).json({
    message: savedMessage,
    sender: senderId,
  });
});

export const getMessageByChat = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { chatId } = req.params;

    if (!userId) {
      res.status(400).json({
        message: "userId not found",
      });
      return;
    }

    if (!chatId) {
      res.status(400).json({
        message: "chatId is required",
      });
      return;
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404).json({
        message: "chat not found",
      });
      return;
    }

    const isUserInChat = chat.users.some(
      (userId) => userId.toString() === userId.toString(),
    );

    if (!isUserInChat) {
      res.status(403).json({
        message: "You are not a participant of this chat",
      });
      return;
    }

    const messagesToMarkSeen = await Messages.find({
      chatId: chatId,
      sender: { $ne: userId },
      seen: false,
    });

    await Messages.updateMany(
      {
        chatId: chatId,
        sender: { $ne: userId },
        seen: false,
      },
      {
        seen: true,
        seenAt: new Date(),
      },
    );

    const messages = await Messages.find({
      chatId: chatId,
    }).sort({ createdAt: 1 });

    const otherUserId = chat.users.find((id) => id !== userId);

    try {
      const { data } = await axios.get(
        `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`,
      );

      if (!otherUserId) {
        res.status(400).json({
          messages: "No other user",
        });
        return;
      }

      //   socket work

      res.json({
        messages,
        user: data.user,
      });
    } catch (error) {
      console.log(error);
      res.json({
        messages,
        user: { _id: otherUserId, name: "unknown" },
      });
    }
  },
);
