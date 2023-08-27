import { registUser } from "../controllers/userController";
import express from "express";

const router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// アカウント作成
router.post("/register",registUser)

// ログイン
// router.post('/login', )

export { router };