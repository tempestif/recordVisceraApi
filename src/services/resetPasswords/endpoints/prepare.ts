import { UNSPECIFIED_USER_ID } from "@/consts/logMessages";
import { TEXT_VALID_RESET_PASS, TITLE_VALID_RESET_PASS } from "@/consts/mail";
import {
  ERROR_MULTIPLE_ACTIVE_USERS,
  SEND_MAIL_FOR_RESET_PASS_VALID,
} from "@/consts/responseMessages";
import { findActivedUsers } from "@/services/users/users";
import {
  badRequestErrorHandle,
  dbRecordNotFoundErrorHandle,
  internalServerErrorHandle,
  multipleActiveUsersErrorHandle,
} from "@/utils/errorHandle/errorHandling";
import {
  BadRequestError,
  DbRecordNotFoundError,
  MultipleActiveUserError,
} from "@/utils/errorHandle/errors";
import { createHash } from "@/utils/hash";
import { logResponse } from "@/utils/logger/utilLogger";
import { sendMail } from "@/utils/nodemailer";
import { customizedPrisma } from "@/utils/prismaClients";
import { AnyRequest } from "@/utils/utilRequest";
import { BasicResponceType, basicHttpResponce } from "@/utils/utilResponse";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Request, Response } from "express";

// logのために関数名を取得
const CURRENT_FUNCTION_NAME = "prepareResettingPassword";

// バリデーション通過後のパラメータの型を作成する
type VerifiedParamsType = undefined;
type VerifiedResBodyType = BasicResponceType;
type VerifiedReqBodyType = {
  email: string;
};
type VerifiedReqQueryType = undefined;
type VerifiedReqLocalsType = {
  userId: number;
};

export type VerifiedRequesetType = Request<
  VerifiedParamsType,
  VerifiedResBodyType,
  VerifiedReqBodyType,
  VerifiedReqQueryType,
  VerifiedReqLocalsType
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
  } else if (e instanceof MultipleActiveUserError) {
    multipleActiveUsersErrorHandle(
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
 * emailに紐づくuserがあるかを確認し、そのuserIdを返却する
 * userがなかったらエラーを投げる
 * @param email
 */
export const getUserIdOrThrow = async (email: string) => {
  const users = await findActivedUsers({ email }, customizedPrisma);
  if (users.length > 1) {
    throw new MultipleActiveUserError(ERROR_MULTIPLE_ACTIVE_USERS.message);
  }

  return users[0].id;
};

/**
 * ユーザーID取得時のエラーハンドル
 * @param e
 * @param req
 * @param res
 * @param userId
 */
export const getUserIdErrorHandle = (
  e: unknown,
  req: AnyRequest,
  res: Response
) => {
  if (e instanceof MultipleActiveUserError) {
    multipleActiveUsersErrorHandle(
      e,
      UNSPECIFIED_USER_ID.message,
      req,
      res,
      CURRENT_FUNCTION_NAME
    );
  } else if (e instanceof DbRecordNotFoundError) {
    dbRecordNotFoundErrorHandle(
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
 * パスワードリセット用ハッシュを生成
 * @returns
 */
export const createPassResetHash = () => {
  return createHash();
};

/**
 * userテーブルにパスワードリセットハッシュをセットする
 * @param id
 * @param passResetHash
 * @returns
 */
export const setPassResetHash = async (id: number, passResetHash: string) => {
  const newUser = await customizedPrisma.user.update({
    where: {
      id,
    },
    data: {
      passResetHash,
    },
  });

  return newUser;
};

/**
 * テーブル更新時のエラーハンドル
 * @param e
 * @param req
 * @param res
 * @param userId
 */
export const setPassResetHashErrorHandle = (
  e: unknown,
  req: AnyRequest,
  res: Response,
  userId: number
) => {
  if (e instanceof PrismaClientKnownRequestError) {
    dbRecordNotFoundErrorHandle(e, userId, req, res, CURRENT_FUNCTION_NAME);
  } else {
    throw e;
  }
};

/**
 * email認証確認用のメールを送信する。
 * @param email 送信先メールアドレス
 * @param url 認証用URL
 */
export const sendVerifyMail = async (user: Prisma.$UserPayload["scalars"]) => {
  // TODO: メールにはフロント(クライアント)のURLを載せたい。これはAPIのURI。
  // NOTE: idとhashをパスワードにbodyに詰めて、メール送信APIを作ってもいいような気がする
  const verifyUrl = `${process.env.BASE_URL}/reset-password/${user.id}/execute/${user.passResetHash}`;

  // 件名
  const mailSubject = TITLE_VALID_RESET_PASS.message;
  // 本文
  const text = TEXT_VALID_RESET_PASS.message(verifyUrl);

  // 送信
  await sendMail(user.email, mailSubject, text);
};

/**
 * email送信時のエラーハンドル
 * @param e
 * @param req
 * @param res
 * @param userId
 */
export const sendVerifyMailErrorHandle = (
  e: unknown,
  req: AnyRequest,
  res: Response,
  userId: number
) => {
  // nodemailerで投げられるエラーはErrorらしい。
  // Errorクラスのサブクラスはそのままthrow。
  if (e instanceof Error && e.constructor === Error) {
    internalServerErrorHandle(e, userId, req, res, CURRENT_FUNCTION_NAME);
  } else {
    throw e;
  }
};

/**
 * レスポンスを返却
 * @param req
 * @param res
 */
export const sendResponse = (req: AnyRequest, res: Response) => {
  // レスポンスを返却
  const httpStatus = 201;
  const responseStatus = true;
  const responseMsg = SEND_MAIL_FOR_RESET_PASS_VALID.message;
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
