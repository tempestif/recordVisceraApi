import { auth } from "@/services/authService";
import { readTemp, registTemp } from "@/controllers/tempController";
import express from "express";
const router = express.Router();

/** 体温を記録 */
router.post("/", auth, registTemp)
/** 体温を参照 */
router.get("/", auth, readTemp)

export { router };