import type { Request, Response } from "express";
import { UNSPECIFIED_USER_ID_TYPE } from "@/consts/logMessages";
import {
  BadRequestError,
  DbRecordNotFoundError,
  MultipleActiveUserError,
  TokenNotFoundError,
} from "@/utils/errorHandle/errors";
import {
  dbRecordNotFoundErrorHandle,
  multipleActiveUsersErrorHandle,
  tokenNotFoundErrorHandle,
  internalServerErrorHandle,
  badRequestErrorHandle,
} from "@/utils/errorHandle/errorHandling";

/**
 * エラーハンドラー
 * 各エラーハンドルをここに集約
 * TODO: これはいつか辞める
 * try...catchを短くし、各catchに必要最低限ハンドルを置く
 * https://zenn.dev/link/comments/bf900ad59f6547
 * @param e
 * @param userId
 * @param req
 * @param res
 * @param funcName
 */
export const errorResponseHandler = (
  e: unknown,
  userId: number | UNSPECIFIED_USER_ID_TYPE,
  req: Request,
  res: Response,
  funcName: string
) => {
  if (e instanceof DbRecordNotFoundError) {
    dbRecordNotFoundErrorHandle(e, userId, req, res, funcName);
  } else if (e instanceof MultipleActiveUserError) {
    multipleActiveUsersErrorHandle(e, userId, req, res, funcName);
  } else if (e instanceof TokenNotFoundError) {
    tokenNotFoundErrorHandle(e, userId, req, res, funcName);
  } else if (e instanceof BadRequestError) {
    badRequestErrorHandle(e, userId, req, res, funcName);
  } else {
    internalServerErrorHandle(e, userId, req, res, funcName);
  }
};
