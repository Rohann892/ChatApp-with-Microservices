"use client";

import { useAppData, user_service } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import axios from "axios";
import Loading from "@/components/Loading";
import { ArrowLeft, Pencil, Save, UserCircle, X } from "lucide-react";

const ProfilePage = () => {
  const { user, isAuth, loading, setUser } = useAppData();
  const [name, setName] = useState<string>("");
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const router = useRouter();

  const editHandler = () => {
    setIsEdit(true);
    setName(user?.name ?? "");
  };

  const cancelHandler = () => {
    setIsEdit(false);
    setName(user?.name ?? "");
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    const token = Cookies.get("token");
    setIsSaving(true);
    try {
      const { data } = await axios.post(
        `${user_service}/api/v1/user/update`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (data.token) {
        Cookies.set("token", data.token, {
          expires: 15,
          secure: false,
          path: "/",
        });
      }

      toast.success(data.message || "Profile updated");
      setUser(data.user);
      setIsEdit(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update name");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>

        {/* Card */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4 ring-4 ring-blue-500/30">
              <UserCircle className="w-16 h-16 text-gray-300" />
            </div>
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
          </div>

          <div className="space-y-4">
            {/* Name field */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Display Name
              </label>
              {isEdit ? (
                <form onSubmit={submitHandler}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
                      placeholder="Enter your name"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 transition-colors flex items-center gap-1"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={cancelHandler}
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2.5 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2.5">
                  <span className="text-white">{user?.name}</span>
                  <button
                    onClick={editHandler}
                    className="text-gray-400 hover:text-blue-400 transition-colors ml-2"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Email field (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <div className="bg-gray-700/50 rounded-lg px-4 py-2.5 border border-gray-600/50">
                <span className="text-gray-300">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
