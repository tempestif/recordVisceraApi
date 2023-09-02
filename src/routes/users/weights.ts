import { registWeight, readWeights, editWeight, deleteWeight } from "@/controllers/weightController";
import { auth } from "@/services/authService";
import express from "express";
const router = express.Router();

/** 新たな体温の記録を作成 */
router.post("/", auth, registWeight)
/** 体温のリストを取得 */
router.get("/", auth, readWeights)
/** 指定した体温の記録を編集 */
router.post("/edit/:id", auth, editWeight)
/** 指定した体温の記録を削除 */
router.post("/delete/:id", auth, deleteWeight)

export { router };