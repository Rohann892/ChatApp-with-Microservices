"use client";
import React, { useEffect, useState } from "react";
import { useAppData } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import ChatSideBar from "@/components/ChatSideBar";

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
    user: logedInUser,
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

  if (loading || !isAuth) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <ChatSideBar
        sidebarOpen={sideBarOpen}
        setSideBarOpen={setSideBarOpne}
        showAllUsers={showAllUser}
        setShowAllUser={setShowAllUser}
        users={users}
        loggedInUser={logedInUser}
        chats={chats}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default ChatApp;
