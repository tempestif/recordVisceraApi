import { verifyMailadress } from "@/controllers/verifyController";
import { editProfile, readProfile, readUser, sendMailTest, changePassowrd } from "@/controllers/userController";
import express from "express";
import { auth } from "@/services/authService";
import type { Request, Response, NextFunction } from "express"

const router = express.Router();

/** ユーザー情報取得 */
router.get("/", auth, readUser)
/** ユーザーパスワード変更 */
router.post("/change-password", auth, changePassowrd)

/** メールアドレスをid, tokenによって認証 */
router.get("/:id/verify/:token", verifyMailadress)


/** プロフィール取得 */
router.get("/profiles", auth, readProfile)
/** プロフィール編集 */
router.post("/profiles", auth, editProfile)

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