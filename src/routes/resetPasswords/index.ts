import { requestResettingPassword, executeResettingPassword } from "@/controllers/resetPasswords/resetPasswordsController";
import express from "express";
const router = express.Router();

/** パスワードリセットをリクエスト */
router.post("/request", requestResettingPassword)

/** パスワードリセットを実行 */
router.post("/execute", executeResettingPassword)
export { router };
