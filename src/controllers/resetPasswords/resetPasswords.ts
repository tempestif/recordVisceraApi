import * as executeService from "@/services/resetPasswords/endpoints/execute";
import * as prepareService from "@/services/resetPasswords/endpoints/prepare";
import { throwValidationError } from "@/utils/errorHandle/validate";
import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

/**
 * パスワード再設定のリクエストを行う
 * トークンを生成してurlをメール送信する。
 * @param req
 * @param res
 * @param next
 */
export const prepareResettingPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // バリデーション結果を評価
  const errors = validationResult(req);
  try {
    throwValidationError(errors);
  } catch (e) {
    prepareService.validationErrorHandle(e, req, res);
  }

  // bodyを取得
  const body = req.body as prepareService.ValidatedPrepareBody;

  // 認証トークン作成
  const passResetHash = prepareService.createPassResetHash();

  let newUser: Prisma.$UserPayload["scalars"] | null = null;

  // ハッシュをDBに保存
  try {
    newUser = await prepareService.setPassResetHash(body.userId, passResetHash);
  } catch (e) {
    prepareService.setPassResetHashErrorHandle(e, req, res, body.userId);
  }

  // ハッシュ付きメールを送信
  try {
    if (newUser) {
      await prepareService.sendVerifyMail(newUser);
    }
  } catch (e) {
    prepareService.sendVerifyMailErrorHandle(e, req, res, body.userId);
  }

  // レスポンスを返却
  prepareService.sendResponse(req, res);
};

/**
 * パスワード再設定を実行する
 * paramのid, tokenを用いて認証、bodyの新パスワードに更新
 * Baseurl/reset-password/:id/execute/:token
 * @param req
 * @param res
 * @param next
 */
export const executeResettingPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // バリデーション結果を評価
  const errors = validationResult(req);
  try {
    throwValidationError(errors);
  } catch (e) {
    executeService.validationErrorHandle(e, req, res);
  }

  // bodyを取得
  const body = req.body as executeService.ValidatedExecuteBody;

  // 新パスワード書き込み
  try {
    await executeService.updatePassword(body.id, body.token, body.newPassword);
  } catch (e) {
    executeService.updatePasswordErrorHandle(e, req, res, body.id);
  }

  // レスポンスを返却
  executeService.sendResponse(req, res);
};
