import {
  readProfile,
  editProfile,
} from "@/controllers/users/profileController";
import { auth } from "@/services/authService";
import express from "express";
const router = express.Router();

/** プロフィール取得 */
router.get("/", auth, readProfile);
/** プロフィール編集 */
router.post("/", auth, editProfile);

export { router };
