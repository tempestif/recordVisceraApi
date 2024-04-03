import { UNEXPECTED_ERROR, UNSPECIFIED_USER_ID_TYPE } from "@/consts/logConsts";
import { logError } from "@/services/logger/loggerService";
import {
  BadRequestError,
  DbRecordNotFoundError,
  MultipleActiveUserError,
  TokenNotFoundError,
} from "@/services/prismaService";
import {
  basicHttpResponce,
  internalServerErr,
} from "@/services/utilResponseService";
import type { Request, Response } from "express";

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
  const HttpStatus = 500;
  const responseMsg = e instanceof Error ? e.message : UNEXPECTED_ERROR.message;

  logError(userId, req, HttpStatus, funcName, responseMsg);
  internalServerErr(res, e);
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
  e: DbRecordNotFoundError,
  userId: number | UNSPECIFIED_USER_ID_TYPE,
  req: Request,
  res: Response,
  funcName: string,
) => {
  // レコードが見つからなかったら401エラー
  const HttpStatus = 401;
  const responseStatus = false;
  const responseMsg = e.message;

  logError(userId, req, HttpStatus, funcName, responseMsg);
  basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);
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
  const HttpStatus = 500;
  const responseStatus = false;
  const responseMsg = e.message;

  logError(userId, req, HttpStatus, funcName, responseMsg);
  basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);
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
  const HttpStatus = 400;
  const responseStatus = false;
  const responseMsg = e.message;

  logError(userId, req, HttpStatus, funcName, responseMsg);
  basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);
};

export const badRequestErrorHandle = (
  e: BadRequestError,
  userId: number | UNSPECIFIED_USER_ID_TYPE,
  req: Request,
  res: Response,
  funcName: string,
) => {
  const HttpStatus = 400;
  const responseStatus = false;
  const responseMsg = e.message;

  logError(userId, req, HttpStatus, funcName, responseMsg);
  basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);
};
