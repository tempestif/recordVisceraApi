import { USER_LOGIN_STATUS } from "@/consts/dbMappings";
import {
  UNSPECIFIED_USER_ID,
  UNSPECIFIED_USER_ID_TYPE,
} from "@/consts/logMessages";
import {
  ERROR_TOKEN_NOT_DISCREPANCY,
  ERROR_TOKEN_NOT_FOUND,
} from "@/consts/responseMessages";
import { findUniqueUserAbsoluteExist } from "@/services/users/users";
import { errorResponseHandler } from "@/utils/errorHandle";
import { customizedPrisma } from "@/utils/prismaClients";
import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { verify } from "jsonwebtoken";
import { basicHttpResponce } from "./utilResponse";

/**
 * トークン認証
 * ログイン済のユーザーのみにしかみれないページにミドルウェアとして使う
 * x-auth-tokenという名前でheaderからtokenを取得する。
 * jwtからデコードしたuserIdをbodyに追加する
 * デコードしたuserIdに該当するユーザーの存在チェックも行う。
 * 存在しない場合400エラー
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const funcName = auth.name;
  //トークン認証
  const jwt = req.header("x-auth-token");

  // tokenがない場合、400エラー
  if (!jwt) {
    const HttpStatus = 400;
    const responseStatus = false;
    const responseMsg = ERROR_TOKEN_NOT_FOUND.message;
    return basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);
  }

  // PrivateKeyがないときはエラー
  const privateKey = process.env.JWTPRIVATEKEY;
  if (!privateKey) {
    throw new Error("auth: 環境変数が足りません");
  }

  let userId: number | UNSPECIFIED_USER_ID_TYPE = UNSPECIFIED_USER_ID.message;

  try {
    // tokenをデコード
    const decoded = (await verify(jwt, privateKey)) as JwtPayload;

    // userの有無を確認
    const user = await findUniqueUserAbsoluteExist(
      { id: decoded.id },
      customizedPrisma
    );
    userId = user.id;

    // ログアウトまたは退会済みの場合、400エラー
    if (
      user.loginStatus === USER_LOGIN_STATUS.logout ||
      user.loginStatus === USER_LOGIN_STATUS.deactived
    ) {
      const HttpStatus = 400;
      const responseStatus = false;
      const responseMsg = ERROR_TOKEN_NOT_DISCREPANCY.message;
      return basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);
    }

    // reqのbodyにuserIdを追加
    // FIXME: req.localsに入れるようにする。その他の部分についても。
    req.body.userId = decoded.id;
    next();
  } catch (e) {
    errorResponseHandler(e, userId, req, res, funcName);
  }
};
