import {
  executeResettingPassword,
  prepareResettingPassword,
} from "@/controllers/resetPasswords/resetPasswords";
import {
  validateExecute,
  validatePrepare,
} from "@/services/resetPasswords/validate";
import express from "express";
const router = express.Router();

/** パスワードリセットをリクエスト */
router.post("/prepare", validatePrepare, prepareResettingPassword);

/** パスワードリセットを実行 */
router.post("/execute", validateExecute, executeResettingPassword);
export { router };
