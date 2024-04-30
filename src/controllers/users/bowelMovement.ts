import type { NextFunction, Request } from "express";

import * as count from "@/services/users/bowelMovements/endpoints/count";
import * as del from "@/services/users/bowelMovements/endpoints/delete";
import * as edit from "@/services/users/bowelMovements/endpoints/edit";
import * as read from "@/services/users/bowelMovements/endpoints/read";
import * as regist from "@/services/users/bowelMovements/endpoints/regist";
import { throwValidationError } from "@/utils/errorHandle/validate";
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
  req: Request,
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
  const VerifiedRequest = req as unknown as regist.VerifiedRequestType;

  const userId = res.locals.userId;
  const body = VerifiedRequest.body;

  // 排便記録を追加
  let bowelMovementData: regist.VerifiedResBodyType["data"] | null = null;
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
    regist.createBowelMovementErrorHandle(e, userId, VerifiedRequest, res);
    return;
  }

  regist.sendResponse(userId, VerifiedRequest, res, bowelMovementData);
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
  req: Request,
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
  const VerifiedRequest = req as unknown as read.VerifiedRequestType;

  // userIdを取得
  const userId = res.locals.userId;

  // クエリ取得
  const query = VerifiedRequest.query;

  // bowelMovements取得
  let bowelMovements:
    | read.VerifiedResBodyType["data"]["bowelMovements"]
    | null = null;
  try {
    bowelMovements = await read.getBowelMovements(userId, query);
  } catch (e) {
    read.getBowelMovementsErrorHandle(e, userId, VerifiedRequest, res);
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

  read.sendResponse(userId, req, res, bowelMovements, allCount);
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
  req: Request,
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
  const VerifiedRequest = req as unknown as edit.VerifiedRequestType;

  // リクエストパラメータの取得
  const id = VerifiedRequest.params.id;
  const userId = res.locals.userId;
  const body = VerifiedRequest.body;

  // 排便記録を更新する
  let newBowelMovement: edit.VerifiedResBodyType["data"] | null = null;
  try {
    newBowelMovement = await edit.updateBowelMovement(id, userId, body);
  } catch (e) {
    edit.updateBowelMovementErrorHandle(e, userId, VerifiedRequest, res);
    return;
  }

  edit.sendResponse(userId, VerifiedRequest, res, newBowelMovement);
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
  req: Request,
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
  const VerifiedRequest = req as unknown as del.VerifiedRequestType;

  // リクエストパラメータの取得
  const id = VerifiedRequest.params.id;
  const userId = res.locals.userId;

  let deletedBowelMovement: del.VerifiedResBodyType["data"] | null = null;
  try {
    deletedBowelMovement = await del.deleteBowelMovement(id, userId);
  } catch (e) {
    del.deleteBowelMovementErrorHandle(e, userId, VerifiedRequest, res);
    return;
  }

  del.sendResponse(userId, VerifiedRequest, res, deletedBowelMovement);
};

/**
 * 日毎の排便回数を返却する
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const countBowelMovementsPerDay = async (
  req: Request,
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
  const VerifiedRequest = req as unknown as count.VerifiedRequestType;

  const userId = res.locals.userId;

  // 日毎に排便記録をカウント
  let dailyBowelMovementsCount: count.DailyBowelMovementsCounts | null = null;
  try {
    dailyBowelMovementsCount = await count.countDailyBowelMovements(userId);
  } catch (e) {
    count.countDailyBowelMovementsErrorHandle(e, userId, VerifiedRequest, res);
    return;
  }

  count.sendResponse(userId, VerifiedRequest, res, dailyBowelMovementsCount);
};
