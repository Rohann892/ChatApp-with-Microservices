"use client";
import React, { useEffect } from "react";
import { useAppData } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };

  seen: boolean;
  createdAt: string;
  seenAt: string;
}

const ChatApp = () => {
  const { isAuth, loading } = useAppData();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuth) {
      router.push("/login");
    }
  }, [isAuth, loading, router]);

  if (loading || !isAuth) {
    return <Loading />;
  }

  return <div>ChatApp - You are successfully authenticated!</div>;
};

export default ChatApp;
