import { verifyMailadress } from "@/controllers/verifyController";
import { editProfile, login, readPrifile, readUser, registUser, sendMailTest } from "@/controllers/userController";
import express from "express";
import { auth } from "@/services/authService";
import type { Request, Response, NextFunction } from "express"

const router = express.Router();

/** ユーザー情報取得 */
// NOTE: 「指定した」ユーザー一人の情報が取れるというのが抜けている。「指定」はauthによってtokenから判別されており、APIをたたく側は何もしていないように感じるようになってはいる。
router.get("/", auth, readUser)

/** 認証前アカウントを作成 */
router.post("/register", registUser)
/** メールアドレスをid, tokenによって認証 */
router.get("/:id/verify/:token", verifyMailadress)

/** ログイン */
router.post("/login", login)

/** プロフィール取得 */
// NOTE: 「指定した」ユーザー一人に紐づくプロフィールが取れるというのが抜けている。「指定」はauthによってtokenから判別されており、APIをたたく側は何もしていないように感じるようになってはいる。
router.get("/profiles", auth, readPrifile)
/** プロフィール編集 */
// NOTE: 「指定した」ユーザー一人に紐づくプロフィールを編集するというのが抜けている。「指定」はauthによってtokenから判別されており、APIをたたく側は何もしていないように感じるようになってはいる。
// NOTE: 「編集」と「更新」
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