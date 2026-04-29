import { User } from "@/context/AppContext";
import { Menu, UserCircle } from "lucide-react";
import React from "react";

interface chatHeaderProps {
  user: User | null;
  setSideBarOpen: (open: boolean) => void;
  isTyping: boolean;
  onlineUsers: string[];
}

const ChatHeader = ({
  user,
  setSideBarOpen,
  isTyping,
  onlineUsers,
}: chatHeaderProps) => {
  return (
    <>
      {/* mobile menu toggele button */}
      <div className="sm:hidden fixed top-4 right-5">
        <button
          className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          onClick={(p) => setSideBarOpen((p) => !p)}
        >
          <Menu className="w-5 h-5 text-gray-200" />
        </button>
      </div>

      {/* Chat header */}
      <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-6 ">
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
                  <UserCircle className="w-8 h-8 text-gray-300" />
                </div>
                {/* online user setup */}
                {onlineUsers.includes(user._id) && (
                  <span className="absolute top-10 right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2  border-gray-900">
                    <span className="absolute inset-0 rounded-full bg-green-500 animate-ping"></span>
                  </span>
                )}
              </div>
              {/* user info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white truncate">
                    {user.name}
                  </h2>
                </div>
                {isTyping ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-blue-500 text-sm font-medium">Typing...</span>
                  </div>
                ) : (
                  <span className={`text-sm font-medium ${onlineUsers.includes(user._id) ? "text-green-400" : "text-gray-400"}`}>
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </span>
                )}
              </div>

              {/* to show typing status after socket io connection */}
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
                <UserCircle className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-400">
                  Select a Conversation
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose a chat from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
