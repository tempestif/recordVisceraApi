import {
  readUser,
  sendMailTest,
  changePassowrd,
  deleteUser,
} from "@/controllers/users/userController";
import express from "express";
import { auth } from "@/utils/auth";
import type { Request, Response, NextFunction } from "express";

const router = express.Router();

/** ユーザー情報取得 */
router.get("/", auth, readUser);
/** ユーザーパスワード変更 */
router.post("/change-password", auth, changePassowrd);
/** ユーザー削除 */
router.post("/delete", auth, deleteUser);

// TODO: 本番前に消す
// メール送信テスト
router.post("/mailtest", sendMailTest);

// TODO: 本番前に消す
// 認証テスト
router.get(
  "/validTest",
  auth,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // レスポンス
      res.status(200).json({
        status: true,
        message: "認証できたよ",
      });
    } catch (e) {
      // エラーの時のレスポンス
      res.status(500).json({
        status: false,
        message: e,
      });
    }
  }
);

export { router };
