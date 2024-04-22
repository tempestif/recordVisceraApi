import type { NextFunction } from "express";

import * as count from "@/services/users/bowelMovements/endpoints/count";
import * as del from "@/services/users/bowelMovements/endpoints/delete";
import * as edit from "@/services/users/bowelMovements/endpoints/edit";
import * as read from "@/services/users/bowelMovements/endpoints/read";
import * as regist from "@/services/users/bowelMovements/endpoints/regist";
import { throwValidationError } from "@/utils/errorHandle/validate";
import { Prisma } from "@prisma/client";
import { validationResult } from "express-validator";

/**
 * 新たな排便記録を作成する
 * dateが入力されなかった場合は現在日時をdateとする
 * @param req userId, bristolStoolScale, blood, drainage, note, date
 * @param res
 * @param next
 * @returns
 */
export const registBowelMovement = async (
  req: regist.VerifiedRequesetType,
  res: regist.VerifiedResponseType,
  next: NextFunction,
) => {
  // バリデーション結果を評価
  const errors = validationResult(req);
  try {
    throwValidationError(errors);
  } catch (e) {
    regist.validationErrorHandle(e, req, res);
    return;
  }

  const userId = res.locals.userId;
  const body = req.body;

  // 排便記録を追加
  let bowelMovementData: Prisma.$Bowel_MovementPayload["scalars"] | null = null;
  try {
    const { blood, drainage, note, bristolStoolScale, date: bodyDate } = body;
    const insertData = {
      date: bodyDate ?? new Date(),
      blood,
      drainage,
      note,
      bristolStoolScale,
    };
    bowelMovementData = await regist.createBowelMovement(userId, insertData);
  } catch (e) {
    regist.createBowelMovementErrorHandle(e, req, res, userId);
    return;
  }

  regist.sendResponse(userId, req, res, bowelMovementData);
};

/**
 * 排便記録のリストを取得
 * クエリで条件を指定
 * sort: 表示順 指定が早い順にandで並び変える
 * fields: 返却されるフィールド 指定されたフィールドのみ返却する。指定がない場合は全部返す
 * limit: 返却データ上限
 * offset: 返却データ開始位置
 * フィールド名: 値でフィルターを行う 一致する値のデータを返却
 * @param req
 * @param res
 * @param next
 */
export const readBowelMovements = async (
  req: read.VerifiedRequestType,
  res: read.VerifiedResponseType,
  next: NextFunction,
) => {
  // バリデーション結果を評価
  const errors = validationResult(req);
  try {
    throwValidationError(errors);
  } catch (e) {
    read.validationErrorHandle(e, req, res);
    return;
  }

  // userIdを取得
  const userId = res.locals.userId;

  // クエリ取得
  const query = req.query;

  // bowelMovements取得
  let bowelMovements:
    | Prisma.TypeMap["model"]["Bowel_Movement"]["operations"]["findMany"]["result"]
    | null = null;
  try {
    bowelMovements = await read.getBowelMovements(userId, query);
  } catch (e) {
    read.getBowelMovementsErrorHandle(e, userId, req, res);
    return;
  }

  // 全体数をカウント
  let allCount: number | null = null;
  try {
    allCount = await read.getAllCount(userId);
  } catch (e) {
    read.getAllCountErrorHandle(e, userId, req, res);
    return;
  }

  read.sendResponse(req, res, bowelMovements, allCount);
};

/**
 * 指定した排便記録を編集する
 * jwtのuserIdと指定した排便記録のuserIdが合致するときのみ編集可能
 * 排便記録は、bowel_movementのidをパラメータに挿入し指定する
 * BaseUrl/users/bowel-movements/edit/:id
 * 編集内容はbodyで送る
 * @param req
 * @param res
 * @param next
 */
export const editBowelMovement = async (
  req: edit.VerifiedRequestType,
  res: edit.VerifiedResponseType,
  next: NextFunction,
) => {
  // バリデーション結果を評価
  const errors = validationResult(req);
  try {
    throwValidationError(errors);
  } catch (e) {
    edit.validationErrorHandle(e, req, res);
    return;
  }

  // リクエストパラメータの取得
  const id = req.params.id;
  const userId = res.locals.userId;
  const body = req.body;

  // 排便記録を更新する
  let newBowelMovement:
    | Prisma.TypeMap["model"]["Bowel_Movement"]["operations"]["update"]["result"]
    | null = null;
  try {
    newBowelMovement = await edit.updateBowelMovement(id, userId, body);
  } catch (e) {
    edit.updateBowelMovementErrorHandle(e, userId, req, res);
    return;
  }

  edit.sendResponse(userId, req, res, newBowelMovement);
};

/**
 * 指定した排便記録を削除する
 * jwtのuserIdと指定した排便記録のuserIdが合致するときのみ削除可能
 * 排便記録は、bowel_movementのidをパラメータに挿入し指定する
 * BaseUrl/users/bowel-movements/edit/:id
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const deleteBowelMovement = async (
  req: del.VerifiedRequestType,
  res: del.VerifiedResponseType,
  next: NextFunction,
) => {
  // バリデーション結果を評価
  const errors = validationResult(req);
  try {
    throwValidationError(errors);
  } catch (e) {
    del.validationErrorHandle(e, req, res);
    return;
  }

  // リクエストパラメータの取得
  const id = req.params.id;
  const userId = res.locals.userId;

  let deletedBowelMovement:
    | Prisma.TypeMap["model"]["Bowel_Movement"]["operations"]["delete"]["result"]
    | null = null;
  try {
    deletedBowelMovement = await del.deleteBowelMovement(id, userId);
  } catch (e) {
    del.deleteBowelMovementErrorHandle(e, userId, req, res);
    return;
  }

  del.sendResponse(userId, req, res, deletedBowelMovement);
};

/**
 * 日毎の排便回数を返却する
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const countBowelMovementsPerDay = async (
  req: count.VerifiedRequestType,
  res: count.VerifiedResponseType,
  next: NextFunction,
) => {
  // バリデーション結果を評価
  const errors = validationResult(req);
  try {
    throwValidationError(errors);
  } catch (e) {
    count.validationErrorHandle(e, req, res);
    return;
  }

  const userId = res.locals.userId;

  // 日毎に排便記録をカウント
  let dailyBowelMovementsCount: count.DailyBowelMovementsCounts | null = null;
  try {
    dailyBowelMovementsCount = await count.countDailyBowelMovements(userId);
  } catch (e) {
    count.countDailyBowelMovementsErrorHandle(e, userId, req, res);
    return;
  }

  count.sendResponse(userId, req, res, dailyBowelMovementsCount);
};
