"use client";
import axios from "axios";
import { ArrowRight, ChevronLeft, Loader2, Lock } from "lucide-react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import Cookies from "js-cookie";
import { useAppData, user_service } from "@/context/AppContext";
import Loading from "./Loading";
import toast from "react-hot-toast";

const VerifyOtp = () => {
  const {
    isAuth,
    setIsAuth,
    setUser,
    loading: userLoading,
    fetchAllChats,
    fetchAllUsers,
  } = useAppData();

  if (isAuth) {
    redirect("/chat");
  }

  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRef = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  const searchParams = useSearchParams();

  const email: string = searchParams.get("email") || "";

  const handleInputRef = (index: number, value: string): void => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLElement>,
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      const newOtp = digits.split("");
      setOtp(newOtp);
      inputRef.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormElement<HTMLFormElement>) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please Enter all the 6 digits");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${user_service}/api/v1/user/verify`, {
        email,
        otp: otpString,
      });
      console.log(data);
      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });
      setOtp(["", "", "", "", "", ""]);
      inputRef.current[0]?.focus();
      setUser(data.user);
      setIsAuth(true);
      fetchAllChats();
      fetchAllUsers();
    } catch (error: any) {
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  const handleResendOtp = async () => {
    setResendLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${user_service}/api/v1/user/login`, {
        email,
      });
      toast.success(data.message);
      setTimer(60);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  if (userLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <div className="text-center mb-8 relative">
            <button className="absolute top-0 left-0 p-2 text-gray-300 hove:text0=-white">
              <ChevronLeft
                className="h-6 w-g"
                onClick={() => router.push("/login")}
              />
            </button>
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Lock size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Verify Your Email
            </h1>
            <p className="text-gray-300 text-lg">We have send otp to</p>
            <p className="text-blue-600">{email}</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xl font-medium text-gray-300 mb-4 text-center"
              >
                Enter your 6 digits Otp here
              </label>
              <div className="flex justify-center in-checked: space-x-3">
                {otp.map((digit, index) => (
                  <input
                    type="text"
                    key={index}
                    ref={(el: HTMLInputElement | null) => {
                      inputRef.current[index] = el;
                    }}
                    value={digit}
                    maxLength={1}
                    onChange={(e) => handleInputRef(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-2xl font-bold text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>
            </div>
            {error && (
              <div className="bg-red-900 border border-red-700 rounded-lg p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex justify-center item-center"
              disabled={loading}
            >
              {loading ? (
                <div className="flex item-center justify-center gap-2">
                  <Loader2 className="w-5 h-5" />
                  Verifying
                </div>
              ) : (
                <div className="flex item-center justify-center gap-2">
                  <span>Verify</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-4">
              Did not recived the code ?
            </p>
            {timer > 0 ? (
              <p className="text-gray-400 text-sm ">
                Resend code in {timer} seconds
              </p>
            ) : (
              <button
                className="text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50"
                disabled={resendLoading}
                onClick={handleResendOtp}
              >
                {resendLoading ? "sending" : "Resend Code"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
