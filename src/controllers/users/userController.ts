import { type Request, type Response, type NextFunction } from "express"
import { customizedPrisma } from "@/services/prismaClients"
import { sendMail } from "@/services/nodemailerService"
import { compare } from "bcrypt"
import { basicHttpResponce, basicHttpResponceIncludeData, internalServerErr } from "@/services/utilResponseService"
import { findUniqueBowelMovementAbsoluteExist } from "@/services/prismaService/bowelMovements"
import { COMPLETE_GET_PROFILE, COMPLETE_UPDATE_PASSWORD, WRONG_LOGIN_INFO } from "@/consts/responseConsts"
import { findUniqueUserAbsoluteExist } from "@/services/prismaService"
import { CustomLogger, LoggingObjType, maskConfInfoInReqBody } from "@/services/LoggerService"
import { PROCESS_FAILURE, PROCESS_SUCCESS } from "@/consts/logConsts"
import { ErrorHandleIncludeDbRecordNotFound } from "@/services/errorHandlingService"
const logger = new CustomLogger()

/**
 * メール送信テスト
 * TODO: 本番前に消す
 */
export const sendMailTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // メールを送信
        const mail = process.env.MAIL_ACCOUNT ?? ""
        await sendMail(mail, "test", "test mail")

        // レスポンス
        res.status(200).json({
            "status": true,
            "message": "[テスト]メールを送信しました。",
        });
    } catch (e) {
        // エラーの時のレスポンス
        internalServerErr(res, e)
    }
}

/**
 * tokenのuserIdからユーザー情報を取得
 * @param req userId
 * @param res id, email, name, createdAt, updatedAt
 * @param next
 * @returns
 */
export const readUser = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: バリデーション
    const { userId } = req.body

    // logのために関数名を取得
    const currentFuncName = readUser.name
    try {
        // userIdでユーザーを取得
        const whereByUserId = { id: userId }
        const user = await findUniqueUserAbsoluteExist(whereByUserId, res)

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = COMPLETE_GET_PROFILE.message
        // password, authCode, verified以外を返却する。
        const { id, email, name, createdAt, updatedAt } = user
        const respondUser = {
            id,
            email,
            name,
            createdAt,
            updatedAt
        }
        basicHttpResponceIncludeData(res, HttpStatus, responseStatus, responseMsg, respondUser)

        // ログを出力
        const logBody: LoggingObjType = {
            userId: userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg
        }
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody)
    } catch (e: unknown) {
        ErrorHandleIncludeDbRecordNotFound(e, userId, req, res, currentFuncName)
    }
}

/**
 * ユーザーパスワードを変更
 * 現在のパスワードが合致していたら新パスワードを更新
 * @param req
 * @param res
 * @param next
 */
export const changePassowrd = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, oldPassword, newPassword } = req.body

    // logのために関数名を取得
    const currentFuncName = changePassowrd.name
    // TODO: バリデーション
    try {
        // userIdでユーザーを取得
        const whereByUserId = { id: userId }
        const user = await findUniqueUserAbsoluteExist(whereByUserId, res)

        // 旧パスワードの一致を確認
        const isValidPassword = await compare(oldPassword, user.password)
        // 合致しなかったら401エラー
        if (!isValidPassword) {
            const HttpStatus = 401
            const responseStatus = false
            const responseMsg = WRONG_LOGIN_INFO.message
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)

            // ログを出力
            const logBody: LoggingObjType = {
                userId,
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

        // パスワードを更新
        const newUser = await customizedPrisma.user.update({
            where: whereByUserId,
            data: {
                password: newPassword
            }
        })

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = COMPLETE_UPDATE_PASSWORD.message
        const { id, email, name, createdAt, updatedAt } = newUser
        const respondUser = {
            id,
            email,
            name,
            createdAt,
            updatedAt
        }
        basicHttpResponceIncludeData(res, HttpStatus, responseStatus, responseMsg, respondUser)

        // ログを出力
        const logBody: LoggingObjType = {
            userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg
        }
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody)
    } catch (e) {
        ErrorHandleIncludeDbRecordNotFound(e, userId, req, res, currentFuncName)
    }
}


/**
 * CDAI算出
 * @param req userId, bristolStoolScale, blood, drainage, note, date
 * @param res
 * @param next
 * @returns
 */
export const readCdai = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, bristolStoolScale, blood, drainage, note, date } = req.body

    // logのために関数名を取得
    const currentFuncName = readCdai.name
    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // userIdから排便記録を取得
        const whereByUserId = { id: userId }
        const bowelMovementData = await findUniqueBowelMovementAbsoluteExist(whereByUserId, res)

        // 水様便、泥状便の数をカウント
        

        
        // dateをDate型に変換
        let dateForDb
        if (!date) {
            // dateが指定なしの場合、現在日時を入力
            dateForDb = new Date()
        } else {
            // dateが指定されていた場合、指定のdate
            dateForDb = new Date(date)
        }

        // 排便記録を追加
        const bowelMovementDataeeee = await customizedPrisma.bowel_Movement.create({
            data: {
                userId,
                day: dateForDb,
                time: dateForDb,
                blood,
                drainage,
                note,
                bristolStoolScale
            }
        })

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = RECORD_BOWEL_MOVEMENT.message
        basicHttpResponceIncludeData(res, HttpStatus, responseStatus, responseMsg, bowelMovementData)

        // ログを出力
        const logBody: LoggingObjType = {
            userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg
        }
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody)
    } catch (e) {
        ErrorHandleIncludeDbRecordNotFound(e, userId, req, res, currentFuncName)
    }
}