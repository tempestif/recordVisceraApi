import { registUser, login } from "@/controllers/accountController";
import { verifyMailadress } from "@/controllers/users/verifyController";
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

/** メールアドレスを認証 */
router.post("/email-verify", verifyMailadress)

export { router };