import {
  countBowelMovementsPerDay,
  deleteBowelMovement,
  editBowelMovement,
  readBowelMovements,
  registBowelMovement,
} from "@/controllers/users/bowelMovement";
import * as validator from "@/services/users/bowelMovements/validate";
import { auth } from "@/utils/auth";
import express from "express";
const router = express.Router();

/** 新たな排便記録を作成 */
router.post("/", auth, validator.regist, registBowelMovement);
/** 排便記録のリストを取得 */
router.get("/", auth, validator.read, readBowelMovements);
/** 指定した排便記録を編集 */
router.post("/edit/:id", auth, validator.edit, editBowelMovement);
/** 指定した排便記録を削除 */
router.post("/delete/:id", auth, validator.del, deleteBowelMovement);
/** 排便回数/日のリストを計算し返却 */
router.get("/count", auth, validator.count, countBowelMovementsPerDay);

export { router };
