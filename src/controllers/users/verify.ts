import { basicHttpResponce } from "@/utils/utilResponse";
import { customizedPrisma } from "@/utils/prismaClients";
import type { Request, Response, NextFunction } from "express";
import {
  COMPLETE_VALID_MAILADDRESS,
  ERROR_TOKEN_NOT_FOUND,
} from "@/consts/responseMessages";
import { USER_VARIFIED } from "@/consts/dbMappings";
import {
  UNSPECIFIED_USER_ID,
  PROCESS_FAILURE,
  PROCESS_SUCCESS,
} from "@/consts/logMessages";
import {
  LoggingObjType,
  maskConfInfoInReqBody,
} from "@/utils/logger/utilLogger";
import { errorResponseHandler } from "@/utils/errorHandle";
import { findUniqueUserAbsoluteExist } from "@/services/users/users";
import { CustomLogger } from "@/utils/logger/loggerClass";
const logger = new CustomLogger();

/**
 * id, tokenより、メールアドレスがユーザーの利用可能なものかを確認する
 * id, tokenはパラメータから取得
 * BaseUrl/:id/verify/:token
 * @param req id, token
 * @param res
 * @param next
 * @returns
 */
export const verifyMailadress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.body.id);
  const token = req.body.token;

  // logのために関数名を取得
  const currentFuncName = verifyMailadress.name;

  try {
    // idからユーザーを検索
    const whereByUserId = { id };
    const user = await findUniqueUserAbsoluteExist(
      whereByUserId,
      customizedPrisma
    );

    // tokenが見つからなかったら400エラー
    if (!user.verifyEmailHash) {
      const HttpStatus = 400;
      const responseStatus = false;
      const responseMsg = ERROR_TOKEN_NOT_FOUND.message;
      basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);

      // ログを出力
      const logBody: LoggingObjType = {
        userId: UNSPECIFIED_USER_ID.message,
        ipAddress: req.ip,
        method: req.method,
        path: req.originalUrl,
        body: maskConfInfoInReqBody(req).body,
        status: String(HttpStatus),
        responseMsg,
      };
      logger.error(PROCESS_FAILURE.message(currentFuncName), logBody);
      return;
    }

    // tokenが一致していたらuserのverifiedをtrueにする
    if (user.verifyEmailHash === token) {
      await customizedPrisma.user.update({
        where: whereByUserId,
        data: {
          verifyEmailHash: "",
          verified: USER_VARIFIED.true,
        },
      });
    }

    // レスポンス
    const HttpStatus = 200;
    const responseStatus = true;
    const responseMsg = COMPLETE_VALID_MAILADDRESS.message;
    basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);

    // ログを出力
    const logBody: LoggingObjType = {
      userId: UNSPECIFIED_USER_ID.message,
      ipAddress: req.ip,
      method: req.method,
      path: req.originalUrl,
      body: maskConfInfoInReqBody(req).body,
      status: String(HttpStatus),
      responseMsg,
    };
    logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody);
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
