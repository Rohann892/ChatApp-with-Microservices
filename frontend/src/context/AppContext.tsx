"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export const user_service = "http://localhost:8000";
export const chat_service = "http://localhost:5002";

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Chat {
  _id: string;
  users: string[];
  latestMessage: {
    text: string;
    sender: string;
  };
  createdAt: string;
  updatedAt: string;
  unseenCount: number;
}

export interface Chats {
  _id: string;
  user: User;
  chat: Chat;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  logoutUser: () => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  fetchAllChats: () => Promise<void>;
  chats: Chats[] | null;
  users: User[] | null;
  setChats: React.Dispatch<React.SetStateAction<Chats[] | null>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  async function fetchUser() {
    try {
      const token = Cookies.get("token");

      //   if (!token) {
      //     setLoading(false);
      //     setIsAuth(false);
      //     return;
      //   }

      console.log("token", token);
      const response = await axios.get(`${user_service}/api/v1/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response:", response.data);
      setUser(response.data.user);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function logoutUser() {
    Cookies.remove("token");
    setUser(null);
    setIsAuth(false);
    toast.success("User Logged out successfully");
  }

  const [chats, setChats] = useState<Chats[] | null>(null);
  async function fetchAllChats() {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(`${chat_service}/api/v1/chat/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setChats(response.data.chats);
    } catch (error: any) {
      console.log(error);
    }
  }

  const [users, setUsers] = useState<User[] | null>(null);

  async function fetchAllUsers() {
    const token = Cookies.get("token");
    try {
      const response = await axios.get(`${user_service}/api/v1/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUser();
    fetchAllChats();
    fetchAllUsers();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuth,
        setIsAuth,
        loading,
        setLoading,
        logoutUser,
        fetchAllChats,
        fetchAllUsers,
        chats,
        users,
        setChats,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useappData must be used within the AppProvider");
  }
  return context;
};
