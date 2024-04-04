import { readProfile, editProfile } from "@/controllers/users/profile";
import { auth } from "@/utils/auth";
import express from "express";
const router = express.Router();

/** プロフィール取得 */
router.get("/", auth, readProfile);
/** プロフィール編集 */
router.post("/", auth, editProfile);

export { router };
