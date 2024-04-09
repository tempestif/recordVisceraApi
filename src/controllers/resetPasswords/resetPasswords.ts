import * as executeService from "@/services/resetPasswords/endpoints/execute";
import * as prepareService from "@/services/resetPasswords/endpoints/prepare";
import { throwValidationError } from "@/utils/errorHandle/validate";
import { Prisma } from "@prisma/client";
import type { NextFunction, Response } from "express";
import { validationResult } from "express-validator";

/**
 * パスワード再設定のリクエストを行う
 * トークンを生成してurlをメール送信する。
 * @param req
 * @param res
 * @param next
 */
export const prepareResettingPassword = async (
  req: prepareService.VerifiedRequesetType,
  res: Response,
  next: NextFunction
) => {
  // バリデーション結果を評価
  const errors = validationResult(req);
  try {
    throwValidationError(errors);
  } catch (e) {
    prepareService.validationErrorHandle(e, req, res);
    return;
  }

  // bodyを取得
  const body = req.body;

  let userId: number | null = null;
  try {
    userId = await prepareService.getUserIdOrThrow(body.email);
  } catch (e) {
    prepareService.getUserIdErrorHandle(e, req, res);
    return;
  }

  // 認証トークン作成
  const passResetHash = prepareService.createPassResetHash();

  // ハッシュをDBに保存
  let newUser: Prisma.$UserPayload["scalars"] | null = null;
  try {
    newUser = await prepareService.setPassResetHash(userId, passResetHash);
  } catch (e) {
    prepareService.setPassResetHashErrorHandle(e, req, res, userId);
    return;
  }

  // ハッシュ付きメールを送信
  try {
    await prepareService.sendVerifyMail(newUser);
  } catch (e) {
    prepareService.sendVerifyMailErrorHandle(e, req, res, userId);
    return;
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
  req: executeService.VerifiedRequesetType,
  res: Response,
  next: NextFunction
) => {
  // バリデーション結果を評価
  const errors = validationResult(req);
  try {
    throwValidationError(errors);
  } catch (e) {
    executeService.validationErrorHandle(e, req, res);
    return;
  }

  // bodyを取得
  const body = req.body;
  const params = req.params;

  // 新パスワード書き込み
  try {
    await executeService.updatePassword(
      Number(params.id),
      params.token,
      body.newPassword
    );
  } catch (e) {
    executeService.updatePasswordErrorHandle(e, req, res, params.id);
    return;
  }

  // レスポンスを返却
  executeService.sendResponse(req, res);
};
