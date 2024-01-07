import { requestResettingPassword, ExecuteResettingPassword } from "@/controllers/resetPasswords/resetPasswordsController";
import express from "express";
const router = express.Router();

/** パスワードリセットをリクエスト */
router.post("/request", requestResettingPassword)

/** パスワードリセットを実行 */
router.post("/execute", ExecuteResettingPassword)
export { router };
