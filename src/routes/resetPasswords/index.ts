import { requestResettingPassword, ExecuteResettingPassword } from "@/controllers/resetPasswords/resetPassowordsController";
import express from "express";
const router = express.Router();

/** パスワードリセットをリクエスト */
router.post("/request", requestResettingPassword)

/** パスワードリセットを実行 */
router.post("/execute", ExecuteResettingPassword)
export { router };
