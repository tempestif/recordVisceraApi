import { countBowelMovementsPerDay, deleteBowelMovement, editBowelMovement, readBowelMovements, registBowelMovement } from "@/controllers/bowelMovementController";
import { auth } from "@/services/authService";
import express from "express";
const router = express.Router();

/** 新たな排便記録を作成 */
router.post("/", auth, registBowelMovement)
/** 排便記録のリストを取得 */
router.get("/", auth, readBowelMovements)
/** 指定した排便記録を編集 */
router.post("/edit/:id", auth, editBowelMovement)
/** 指定した排便記録を削除 */
router.post("/delete/:id", auth, deleteBowelMovement)
/** 排便回数/日のリストを計算し返却 */
router.get("/count", auth, countBowelMovementsPerDay)

export { router };