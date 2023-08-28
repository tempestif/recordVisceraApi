import { verifyMailadress } from "../controllers/verifyController";
import { editProfile, login, registUser, sendMailTest } from "../controllers/userController";
import express from "express";
import { auth } from "../services/authService";

// TODO: 消せ。
import type { Request, Response, NextFunction } from "express"

const router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

/** アカウント作成 */
router.post("/register", registUser)
/** メールアドレス認証 */
router.get("/:id/verify/:token", verifyMailadress)

/** ログイン */
router.post("/login", login)

/** プロフィール編集 */
router.post("/profile", auth, editProfile)

// TODO: 本番前に消す
// メール送信テスト
router.post("/mailtest", sendMailTest)

// TODO: 本番前に消す
// 認証テスト
router.get("/validTest", auth, (req: Request, res: Response, next: NextFunction) => {
  try {
    // レスポンス
    res.status(200).json({
      "status": true,
      "message": "認証できたよ",
    });
  } catch (e) {
    // エラーの時のレスポンス
    res.status(500).json({
      "status": false,
      "message": e,
    });
  }
})

export { router };