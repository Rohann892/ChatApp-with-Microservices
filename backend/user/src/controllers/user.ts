import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import { User } from "../model/user.js";

export const loginUser = TryCatch(async (req, res) => {
  const { email } = req.body;

  const rateLimitKey = `otp-ratelimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);

  if (rateLimit) {
    return res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
    });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpKey = `otp: ${email}`;
  await redisClient.set(otpKey, otp, {
    EX: 300,
  });

  await redisClient.set(rateLimitKey, "true", {
    EX: 60,
  });

  const message = {
    to: email,
    subject: "Your otp code",
    body: `Your OTP is ${otp}, It is valid for 5 minutes`,
  };

  await publishToQueue("send-otp", message);
  res.status(200).json({
    message: "OTP send to your mail",
  });
});

export const verifyUser = TryCatch(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email or otp not found",
    });
  }

  const otpKey = `otp: ${email}`;
  const storedOtp = await redisClient.get(otpKey);

  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid or Expired OTP",
    });
  }

  await redisClient.del(otpKey);

  let user = await User.findOne({ email });
  if (!user) {
    const name = email.slice(0, 8);
    user = await User.create({
      name,
      email,
    });
  }

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: "user verified",
    token,
    user,
  });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  return res.status(200).json({
    success: true,
    user,
  });
});

export const upadateName = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  user.name = req.body.name;
  await user.save();
  const token = generateToken(user);
  return res.status(200).json({
    success: true,
    message: "Name updated successfully",
    user,
    token,
  });
});

export const getAllUser = TryCatch(async (req: AuthenticatedRequest, res) => {
  const users = await User.find();
  return res.status(200).json({
    success: true,
    users,
  });
});

export const getAUser = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.params.id);
  return res.status(200).json({
    success: true,
    user,
  });
});
