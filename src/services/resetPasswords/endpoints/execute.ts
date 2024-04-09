import { UNSPECIFIED_USER_ID } from "@/consts/logMessages";
import {
  COMPLETE_VALID_RESET_PASS,
  ERROR_TOKEN_NOT_FOUND,
} from "@/consts/responseMessages";
import {
  badRequestErrorHandle,
  dbRecordNotFoundErrorHandle,
  tokenNotFoundErrorHandle,
} from "@/utils/errorHandle/errorHandling";
import {
  BadRequestError,
  TokenNotFoundError,
} from "@/utils/errorHandle/errors";
import { logResponse } from "@/utils/logger/utilLogger";
import { customizedPrisma } from "@/utils/prismaClients";
import { AnyRequest } from "@/utils/utilRequest";
import { BasicResponceType, basicHttpResponce } from "@/utils/utilResponse";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Request, Response } from "express";

// logのために関数名を定義
const CURRENT_FUNCTION_NAME = "executeResettingPassword";

// バリデーション通過後のパラメータの型を作成する
type VerifiedParamsType = {
  id: number;
  token: string;
};
type VerifiedResBodyType = BasicResponceType;
type VerifiedReqBodyType = {
  newPassword: string;
};
type VerifiedReqQueryType = undefined;

export type VerifiedRequesetType = Request<
  VerifiedParamsType,
  VerifiedResBodyType,
  VerifiedReqBodyType,
  VerifiedReqQueryType
>;

/**
 * バリデーションエラー時のエラーハンドル
 * @param e
 * @param req
 * @param res
 */
export const validationErrorHandle = (
  e: unknown,
  req: AnyRequest,
  res: Response
) => {
  if (e instanceof BadRequestError) {
    badRequestErrorHandle(
      e,
      UNSPECIFIED_USER_ID.message,
      req,
      res,
      CURRENT_FUNCTION_NAME
    );
  } else {
    throw e;
  }
};

/**
 * DBに再設定したパスワードを書き込む
 */
export const updatePassword = async (
  id: number,
  token: string,
  newPassword: string
) => {
  // idからユーザーを検索
  const user = await customizedPrisma.user.findUniqueOrThrow({ where: { id } });

  // tokenが見つからない、または一致しない場合はエラー
  if (!user?.passResetHash || user.passResetHash !== token) {
    throw new TokenNotFoundError(ERROR_TOKEN_NOT_FOUND.message);
  }

  // 書き込み
  await customizedPrisma.user.update({
    where: { id },
    data: {
      passResetHash: "",
      password: newPassword,
    },
  });
};

/**
 * 新パスワード書き込み時のエラーハンドル
 * @param e
 * @param req
 * @param res
 * @param userId
 */
export const updatePasswordErrorHandle = (
  e: unknown,
  req: AnyRequest,
  res: Response,
  userId: number
) => {
  if (e instanceof TokenNotFoundError) {
    tokenNotFoundErrorHandle(e, userId, req, res, CURRENT_FUNCTION_NAME);
  } else if (e instanceof PrismaClientKnownRequestError) {
    dbRecordNotFoundErrorHandle(e, userId, req, res, CURRENT_FUNCTION_NAME);
  } else {
    throw e;
  }
};

/**
 * レスポンスを返却
 * @param req
 * @param res
 * @param CURRENT_FUNCTION_NAME
 */
export const sendResponse = (req: AnyRequest, res: Response) => {
  // レスポンスを返却
  const httpStatus = 200;
  const responseStatus = true;
  const responseMsg = COMPLETE_VALID_RESET_PASS.message;
  basicHttpResponce(res, httpStatus, responseStatus, responseMsg);

  // ログを出力
  logResponse(
    UNSPECIFIED_USER_ID.message,
    req,
    httpStatus,
    responseMsg,
    CURRENT_FUNCTION_NAME
  );
};
