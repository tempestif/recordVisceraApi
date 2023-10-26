import { registUser, login, logout } from "@/controllers/accountController";
import { verifyMailadress } from "@/controllers/users/verifyController";
import { auth } from "@/services/authService";
import express from "express";
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/** 認証前アカウントを作成 */
router.post("/register", registUser)

/** ログイン */
router.post("/login", login)

/** ログアウト */
router.post("/logout", auth, logout)

/** メールアドレスを認証 */
router.post("/email-verify", verifyMailadress)

export { router };