import express from "express";
import {
  getAllUser,
  getAUser,
  loginUser,
  myProfile,
  upadateName,
  verifyUser,
} from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/verify", verifyUser);
router.get("/me", isAuth, myProfile);
router.get("/all", isAuth, getAllUser);
router.get("/:id", isAuth, getAUser);
router.post("/update", isAuth, upadateName);

export default router;
