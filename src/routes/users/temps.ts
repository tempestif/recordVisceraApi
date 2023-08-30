import { auth } from "@/services/authService";
import { readTemps, registTemp } from "@/controllers/tempController";
import express from "express";
const router = express.Router();

/** 体温を記録 */
router.post("/", auth, registTemp)
/** 体温のリストを取得 */
router.get("/", auth, readTemps)

export { router };