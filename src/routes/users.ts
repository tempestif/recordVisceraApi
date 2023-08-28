import { verifyMailadress } from "../controllers/verifyController";
import { registUser, sendMailTest } from "../controllers/userController";
import express from "express";

const router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// アカウント作成
router.post("/register", registUser)

// メール送信テスト
router.post("/mailtest", sendMailTest)

// メールアドレス認証
router.get("/:id/verify/:token", verifyMailadress)

// ログイン
// router.post('/login', )

export { router };