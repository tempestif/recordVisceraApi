import { UNSPECIFIED_USER_ID } from "@/consts/logConsts";
import { BAD_REQUEST } from "@/consts/mailConsts";
import {
  COMPLETE_VALID_RESET_PASS,
  MULTIPLE_ACTIVE_USERS,
  SEND_MAIL_FOR_RESET_PASS_VALID,
  TOKEN_NOT_FOUND,
} from "@/consts/responseConsts";
import { logResponse } from "@/utils/logger/utilLogger";
import { errorResponseHandler } from "@/utils/errorHandle";
import { sendMailForResetPasswordVerify } from "@/services/resetPasswords/resetPasswordsService";
import { customizedPrisma } from "@/utils/prismaClients";
import {
  BadRequestError,
  MultipleActiveUserError,
  TokenNotFoundError,
} from "@/utils/errorHandle/errors";
import {
  findActivedUser,
  findUniqueUserAbsoluteExist,
} from "@/services/users/usersService";
import { basicHttpResponce } from "@/utils/utilResponse";
import { randomBytes } from "crypto";
import type { Request, Response, NextFunction } from "express";

/**
 * パスワード再設定のリクエストを行う
 * トークンを生成してurlをメール送信する。
 * @param req
 * @param res
 * @param next
 */
export const requestResettingPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  // logのために関数名を取得
  const currentFuncName = requestResettingPassword.name;

  try {
    if (!email) {
      throw new BadRequestError(BAD_REQUEST.message);
    }

    // emailからuserを取得
    const whereByEmail = { email };
    const users = await findActivedUser(whereByEmail, customizedPrisma);
    if (users.length !== 1) {
      throw new MultipleActiveUserError(MULTIPLE_ACTIVE_USERS.message);
    }

    const user = users[0];

    // 認証トークン作成
    const passResetHash = randomBytes(32).toString("hex");

    // DBに保存
    const newUser = await customizedPrisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passResetHash,
      },
    });

    // メール送信
    // TODO: メールにはフロント(クライアント)のURLを載せたい。これはAPIのURI。
    const verifyUrl = `${process.env.BASE_URL}/reset-password/${newUser.id}/execute/${newUser.passResetHash}`;
    await sendMailForResetPasswordVerify(email, verifyUrl);

    // レスポンスを返却
    const HttpStatus = 201;
    const responseStatus = true;
    const responseMsg = SEND_MAIL_FOR_RESET_PASS_VALID.message;
    basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);

    // ログを出力
    logResponse(
      UNSPECIFIED_USER_ID.message,
      req,
      HttpStatus,
      responseMsg,
      currentFuncName
    );
  } catch (e) {
    errorResponseHandler(
      e,
      UNSPECIFIED_USER_ID.message,
      req,
      res,
      currentFuncName
    );
  }
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
  const id = Number(req.body.id);
  const { token, newPassword } = req.body;

  // logのために関数名を取得
  const currentFuncName = executeResettingPassword.name;

  try {
    if (!id || !token || !newPassword) {
      throw new BadRequestError(BAD_REQUEST.message);
    }
    // idからユーザーを検索
    const whereByUserId = { id };
    const user = await findUniqueUserAbsoluteExist(
      whereByUserId,
      customizedPrisma
    );

    // tokenが見つからない、または一致しない場合は400エラー
    if (!user?.passResetHash || user.passResetHash !== token) {
      throw new TokenNotFoundError(TOKEN_NOT_FOUND.message);
    }

    await customizedPrisma.user.update({
      where: whereByUserId,
      data: {
        passResetHash: "",
        password: newPassword,
      },
    });

    // レスポンス
    const HttpStatus = 200;
    const responseStatus = true;
    const responseMsg = COMPLETE_VALID_RESET_PASS.message;
    basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);

    // ログを出力
    logResponse(
      UNSPECIFIED_USER_ID.message,
      req,
      HttpStatus,
      responseMsg,
      currentFuncName
    );
  } catch (e) {
    // エラーの時のレスポンス
    errorResponseHandler(
      e,
      UNSPECIFIED_USER_ID.message,
      req,
      res,
      currentFuncName
    );
  }
};
