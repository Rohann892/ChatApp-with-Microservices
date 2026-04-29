"use client";
import React, { useEffect, useState } from "react";
import { chat_service, useAppData, User } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import ChatSideBar from "@/components/ChatSideBar";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import MessageInput from "@/components/MessageInput";

import { SocketData } from "@/context/SocketContext";

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  createdAt: string;
  seenAt?: string;
}

const ChatApp = () => {
  const {
    isAuth,
    loading,
    logoutUser,
    chats,
    users,
    user: loggedInUser,
    fetchAllChats,
    setChats,
  } = useAppData();

  const { onlineUsers, socket } = SocketData();
  console.log(onlineUsers);

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sideBarOpen, setSideBarOpne] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAllUser, setShowAllUser] = useState(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(
    null,
  );

  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuth) {
      router.push("/login");
    }
  }, [isAuth, loading, router]);

  const handleLogout = () => logoutUser();

  async function fetchChat() {
    const token = Cookies.get("token");
    try {
      const { data } = await axios.get(
        `${chat_service}/api/v1/chat/message/${selectedUser}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setMessages(data.messages);
      setUser(data.user);
      await fetchAllChats();
    } catch (error) {
      console.log(error);
      toast.error("Failed to laod Messages");
    }
  }

  const moveChatToTop = (
    chatId: string,
    newMessage: any,
    updatedUnseenCount = true,
  ) => {
    setChats((prev) => {
      if (!prev) return null;

      const updatedChats = [...prev];
      const chatIndex = updatedChats.findIndex(
        (chat) => chat.chat._id === chatId,
      );

      if (chatIndex != -1) {
        const [moveChat] = updatedChats.splice(chatIndex, 1);

        const updatedChat = {
          ...moveChat,
          latestMessage: {
            text: newMessage.text,
            sender: newMessage.sender,
          },
          updatedAt: new Date().toString(),

          unseenCount:
            updatedUnseenCount && newMessage.sender !== loggedInUser?._id
              ? (moveChat.chat.unseenCount || 0) + 1
              : moveChat.chat.unseenCount || 0,
        };
        updatedChats.unshift(updatedChat);
      }
      return updatedChats;
    });
  };

  const resetUnseenCount = (chatId: string) => {
    setChats((prev) => {
      if (!prev) return null;

      return prev.map((chat) => {
        if (chat.chat._id === chatId) {
          return {
            ...chat,
            chat: {
              ...chat.chat,
              unseenCount: 0,
            },
          };
        }
        return chat;
      });
    });
  };

  async function createChat(u: User) {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${chat_service}/api/v1/chat/create`,
        {
          userId: loggedInUser?._id,
          otherUserId: u._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(data);
      setSelectedUser(data.chatId);
      setShowAllUser(false);
      await fetchAllChats();
    } catch (error) {
      toast.error("Failed to Start Chat");
    }
  }

  const handleMessageSend = async (e: any, imageFile?: File | null) => {
    e.preventDefault();

    if (!selectedUser) return;

    // socket work

    if (typingTimeOut) {
      clearTimeout(typingTimeOut);
      setTypingTimeOut(null);
    }

    socket?.emit("stopTyping", {
      chatId: selectedUser,
      userId: loggedInUser?._id,
    });

    const token = Cookies.get("token");
    if (!token) return;

    try {
      const formData = new FormData();
      formData.append("chatId", selectedUser!);

      if (message.trim()) {
        formData.append("text", message);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const { data } = await axios.post(
        `${chat_service}/api/v1/chat/message`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log(data);
      setMessages((prev) => {
        const currnetMessages = prev || [];
        const messageExists = currnetMessages.some(
          (msg) => msg._id === data.message._id,
        );
        if (!messageExists) return [...currnetMessages, data.message];
        return currnetMessages;
      });
      setMessage("");

      const displayText = imageFile ? "📸 image" : message;
      moveChatToTop(
        selectedUser!,
        {
          text: displayText,
          sender: loggedInUser?._id,
        },
        false,
      );
    } catch (error: any) {
      console.log(error);
      toast.error("Send Message Error");
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    if (!selectedUser || !socket) return;
    // socket setup

    if (value.trim()) {
      socket.emit("typing", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
    }

    if (typingTimeOut) {
      clearTimeout(typingTimeOut);
    }

    const timeOut = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
    }, 2000);

    setTypingTimeOut(timeOut);
  };

  useEffect(() => {
    socket?.on("newMessage", (message) => {
      console.log(`Received new message`, message);
      if (selectedUser === message.chatId) {
        setMessages((prev) => {
          const currnetMessages = prev || [];
          const messageExists = currnetMessages.some(
            (msg) => msg._id === message._id,
          );

          if (!messageExists) {
            return [...currnetMessages, message];
          }
          return currnetMessages;
        });
        moveChatToTop(message.chatId, message, false);
      } else {
        moveChatToTop(message.chatId, message, true);
      }
    });

    socket?.on("messageSeen", (data) => {
      console.log("message seen by", data);

      if (selectedUser === data.chatId) {
        setMessages((prev) => {
          if (!prev) return null;
          return prev.map((msg) => {
            if (
              msg.sender === loggedInUser?._id &&
              data.messageIds &&
              data.messageIds.includes(msg._id)
            ) {
              return {
                ...msg,
                seen: true,
                seenAt: new Date().toString(),
              };
            } else if (msg.sender === loggedInUser?._id && !data.messageIds) {
              return {
                ...msg,
                seen: true,
                seenAt: new Date().toString(),
              };
            }
            return msg;
          });
        });
      }
    });

    socket?.on("userTyping", (data) => {
      console.log(`received user typing`, data);
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(true);
      }
    });
    socket?.on("userStoppedTyping", (data) => {
      console.log(`received user stopped typing`, data);
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket?.off("newMessage");
      socket?.off("messageSeen");
      socket?.off("userTyping");
      socket?.off("userStoppedTyping");
    };
  }, [socket, selectedUser, setChats, loggedInUser?._id]);

  useEffect(() => {
    if (selectedUser) {
      fetchChat();
      setIsTyping(false);
      resetUnseenCount(selectedUser);

      socket?.emit("join", selectedUser);

      return () => {
        socket?.emit("leaveChat", selectedUser);
        setMessages(null);
      };
    }
  }, [selectedUser, socket]);

  useEffect(() => {
    return () => {
      if (typingTimeOut) {
        clearTimeout(typingTimeOut);
      }
    };
  }, [typingTimeOut]);

  if (loading || !isAuth) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex overflow-hidden">
      <ChatSideBar
        sidebarOpen={sideBarOpen}
        setSideBarOpen={setSideBarOpne}
        showAllUsers={showAllUser}
        setShowAllUser={setShowAllUser}
        users={users}
        loggedInUser={loggedInUser}
        chats={chats}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleLogout={handleLogout}
        createChat={createChat}
        onlineUsers={onlineUsers}
      />
      <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-2xl bg-white/5 border-1 border-white/10">
        <ChatHeader
          user={user}
          setSideBarOpen={setSideBarOpne}
          isTyping={isTyping}
          onlineUsers={onlineUsers}
        />
        <ChatMessages
          selectedUser={selectedUser}
          messages={messages}
          loggedInUser={loggedInUser}
        />
        <MessageInput
          selectedUser={selectedUser}
          message={message}
          setMessage={handleTyping}
          handleMessageSend={handleMessageSend}
        />
      </div>
    </div>
  );
};

export default ChatApp;
