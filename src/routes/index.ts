import { registUser, login } from "@/controllers/accountController";
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

export { router };