import {
  UNEXPECTED_ERROR,
  UNSPECIFIED_USER_ID_TYPE,
} from "@/consts/logMessages";
import {
  AccessForbiddenError,
  BadRequestError,
  DbRecordNotFoundError,
  MultipleActiveUserError,
  TokenNotFoundError,
} from "@/utils/errorHandle/errors";
import { logError } from "@/utils/logger/utilLogger";
import { basicHttpResponce } from "@/utils/utilResponse";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { Request, Response } from "express";

// TODO: responseStausやresponseMsgについて、処理をまとめられそう。

/**
 * インターナルサーバーエラー
 * 汎用
 * @param e
 * @param userId
 * @param req
 * @param res
 * @param funcName
 */
export const internalServerErrorHandle = (
  e: unknown,
  userId: number | UNSPECIFIED_USER_ID_TYPE,
  req: Request,
  res: Response,
  funcName: string,
) => {
  const httpStatus = 500;
  const responseStatus = false;
  const responseMsg = e instanceof Error ? e.message : UNEXPECTED_ERROR.message;

  logError(userId, req, httpStatus, funcName, responseMsg);
  basicHttpResponce(res, httpStatus, responseStatus, responseMsg);
};

/**
 * DBから対象のレコードが見つからない
 * @param e
 * @param userId
 * @param req
 * @param res
 * @param funcName
 */
export const dbRecordNotFoundErrorHandle = (
  e: DbRecordNotFoundError | PrismaClientKnownRequestError,
  userId: number | UNSPECIFIED_USER_ID_TYPE,
  req: Request,
  res: Response,
  funcName: string,
) => {
  // レコードが見つからなかったら401エラー
  const httpStatus = 401;
  const responseStatus = false;
  const responseMsg = e.message;

  logError(userId, req, httpStatus, funcName, responseMsg);
  basicHttpResponce(res, httpStatus, responseStatus, responseMsg);
};

/**
 * アクティブユーザーが複数いる
 * @param e
 * @param userId
 * @param req
 * @param res
 * @param funcName
 */
export const multipleActiveUsersErrorHandle = (
  e: MultipleActiveUserError,
  userId: number | UNSPECIFIED_USER_ID_TYPE,
  req: Request,
  res: Response,
  funcName: string,
) => {
  // ユニークな条件でユーザーが複数取れたら500エラー
  // ((サーバー内部の問題は500で返すから
  const httpStatus = 500;
  const responseStatus = false;
  const responseMsg = e.message;

  logError(userId, req, httpStatus, funcName, responseMsg);
  basicHttpResponce(res, httpStatus, responseStatus, responseMsg);
};

/**
 * 認証トークンが見つからない
 * @param e
 * @param userId
 * @param req
 * @param res
 * @param funcName
 */
export const tokenNotFoundErrorHandle = (
  e: TokenNotFoundError,
  userId: number | UNSPECIFIED_USER_ID_TYPE,
  req: Request,
  res: Response,
  funcName: string,
) => {
  const httpStatus = 400;
  const responseStatus = false;
  const responseMsg = e.message;

  logError(userId, req, httpStatus, funcName, responseMsg);
  basicHttpResponce(res, httpStatus, responseStatus, responseMsg);
};

export const badRequestErrorHandle = (
  e: BadRequestError,
  userId: number | UNSPECIFIED_USER_ID_TYPE,
  req: Request,
  res: Response,
  funcName: string,
) => {
  const httpStatus = 400;
  const responseStatus = false;
  const responseMsg = e.message;

  logError(userId, req, httpStatus, funcName, responseMsg);
  basicHttpResponce(res, httpStatus, responseStatus, responseMsg);
};

export const accessForbiddenErrorHandle = (
  e: AccessForbiddenError,
  userId: number | UNSPECIFIED_USER_ID_TYPE,
  req: Request,
  res: Response,
  funcName: string,
) => {
  const httpStatus = 403;
  const responseStatus = false;
  const responseMsg = e.message;

  logError(userId, req, httpStatus, funcName, responseMsg);
  basicHttpResponce(res, httpStatus, responseStatus, responseMsg);
};
