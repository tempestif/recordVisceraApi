import { auth } from "@/services/authService";
import { readTemps, registTemp } from "@/controllers/tempController";
import express from "express";
const router = express.Router();

/** 新たな体温の記録を作成 */
router.post("/", auth, registTemp)
/** 体温のリストを取得 */
router.get("/", auth, readTemps)

export { router };