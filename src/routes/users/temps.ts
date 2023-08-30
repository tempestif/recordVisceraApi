import { auth } from "@/services/authService";
import { deleteTemps, editTemps, readTemps, registTemp } from "@/controllers/tempController";
import express from "express";
const router = express.Router();

/** 新たな体温の記録を作成 */
router.post("/", auth, registTemp)
/** 体温のリストを取得 */
router.get("/", auth, readTemps)
/** 指定した体温の記録を編集 */
router.post("/edit/:id", auth, editTemps)
/** 指定した体温の記録を削除 */
router.post("/delete/:id", auth, deleteTemps)

export { router };