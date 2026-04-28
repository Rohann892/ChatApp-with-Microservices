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
import { totalmem } from "os";
import { Form } from "lucide-react";

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

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sideBarOpen, setSideBarOpne] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAllUser, setShowAllUser] = useState(false);
  const [isTyping, setIsTyping] = useState<NodeJS.Timeout | null>(null);

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

      const displayText = imageFile ? "📸 image" : message.trim();
    } catch (error: any) {
      console.log(error);
      toast.error("Send Message Error");
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    if (!selectedUser) return;
    // socket setup
  };

  useEffect(() => {
    if (selectedUser) {
      fetchChat();
    }
  }, [selectedUser]);

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
      />
      <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-2xl bg-white/5 border-1 border-white/10">
        <ChatHeader
          user={user}
          setSideBarOpen={setSideBarOpne}
          isTyping={isTyping}
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
