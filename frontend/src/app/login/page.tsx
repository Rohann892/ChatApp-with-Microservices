"use client";
import axios from "axios";
import { ArrowRight, Divide, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleSubmit = async (
    e: React.FormEvent<HTMLElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `http://localhost:8000/api/v1/user/login`,
        {
          email,
        },
      );
      alert(data.message);
      console.log(data);
      router.push(`/verify?email=${email}`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Mail size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Welcome to ChatApp
            </h1>
            <p className="text-gray-300 text-lg">
              Enter your email to continue your journey
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xl font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                className="w-full px-4 py-4 bg-gray-700 border border-gray-600 text-white placeholder:-gray-400 rounded-2xl"
                placeholder="Enter your Email Address"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex justify-center item-center"
              disabled={loading}
            >
              {loading ? (
                <div className="flex item-center justify-center gap-2">
                  <Loader2 className="w-5 h-5" />
                  Sending otp to your mail
                </div>
              ) : (
                <div className="flex item-center justify-center gap-2">
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
