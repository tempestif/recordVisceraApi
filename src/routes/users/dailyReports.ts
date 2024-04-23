import {
  deleteDailyReport,
  editDailyReport,
  readDailyReport,
  registDailyReport,
} from "@/controllers/users/dailyReport";
import { auth } from "@/utils/auth";
import express from "express";
const router = express.Router();

/** 今日の体調を取得 */
router.get("/", auth, readDailyReport);
/** 今日の体調を作成 */
router.post("/", auth, registDailyReport);
/** 今日の体調を編集 */
router.post("/edit/:id", auth, editDailyReport);
/** 今日の体調を削除 */
router.post("/delete/:id", auth, deleteDailyReport);

export { router };
