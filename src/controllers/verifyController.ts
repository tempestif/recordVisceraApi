import { basicHttpResponce, internalServerErr } from "@/services/utilResponseService";
import { customizedPrisma } from "@/services/prismaClients";
import type { Request, Response, NextFunction } from "express";
import { COMPLETE_VALID_MAILADDRESS, USER_NOT_FOUND, TOKEN_NOT_FOUND } from "@/consts/responseConsts";
import { USER_VARIFIED } from "@/consts/db";
import { UNSPECIFIED_USER_ID, PROCESS_FAILURE, PROCESS_SUCCESS } from "@/consts/logConsts";
import { CustomLogger, LoggingObjType, maskConfInfoInReqBody } from "@/services/LoggerService";
import { internalServerErrorHandle } from "@/services/errorHandlingService";
const logger = new CustomLogger()

/**
 * id, tokenより、メールアドレスがユーザーの利用可能なものかを確認する
 * id, tokenはパラメータから取得
 * BaseUrl/:id/verify/:token
 * @param req id, token
 * @param res
 * @param next
 * @returns
 */
export const verifyMailadress = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)
    const token = req.params.token

    // logのために関数名を取得
    const currentFuncName = verifyMailadress.name

    try {
        // idからユーザーを検索
        const user = await customizedPrisma.user.findUnique({
            where: { id }
        })

        // ユーザーが見つからなかったら400エラー
        if (!user) {
            const HttpStatus = 400
            const responseStatus = false
            const responseMsg = USER_NOT_FOUND.message
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)

            // ログを出力
            const logBody: LoggingObjType = {
                userId: UNSPECIFIED_USER_ID.message,
                ipAddress: req.ip,
                method: req.method,
                path: req.originalUrl,
                body: maskConfInfoInReqBody(req).body,
                status: String(HttpStatus),
                responseMsg
            }
            logger.error(PROCESS_FAILURE.message(currentFuncName), logBody)

            return
        }

        // tokenが見つからなかったら400エラー
        if (!user.authCode) {
            const HttpStatus = 400
            const responseStatus = false
            const responseMsg = TOKEN_NOT_FOUND.message
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)

            // ログを出力
            const logBody: LoggingObjType = {
                userId: UNSPECIFIED_USER_ID.message,
                ipAddress: req.ip,
                method: req.method,
                path: req.originalUrl,
                body: maskConfInfoInReqBody(req).body,
                status: String(HttpStatus),
                responseMsg
            }
            logger.error(PROCESS_FAILURE.message(currentFuncName), logBody)
            return
        }

        // tokenが一致していたらuserのverifiedをtrueにする
        if (user.authCode === token) {
            await customizedPrisma.user.update({
                where: {
                    id: id
                },
                data: {
                    authCode: "",
                    verified: USER_VARIFIED.true
                }
            })
        }

        // レスポンス
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = COMPLETE_VALID_MAILADDRESS.message
        basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)

        // ログを出力
        const logBody: LoggingObjType = {
            userId: UNSPECIFIED_USER_ID.message,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg
        }
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody)
    } catch (e) {
        // エラーの時のレスポンス
        internalServerErrorHandle(e, UNSPECIFIED_USER_ID.message, req, res, currentFuncName)
    }
}
