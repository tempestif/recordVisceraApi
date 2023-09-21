import { type Request, type Response, type NextFunction } from "express"
import { customizedPrisma } from "@/services/prismaClients"
import { sendMail } from "@/services/nodemailerService"
import { randomBytes } from "crypto"
import { compare } from "bcrypt"
import { generateAuthToken } from "@/services/jwtService"
import { basicHttpResponce, basicHttpResponceIncludeData, internalServerErr } from "@/services/utilResponseService"
import { ALREADY_USED_MAILADDLESS, COMPLETE_GET_PROFILE, COMPLETE_LOGIN, COMPLETE_UPDATE_PASSWORD, COMPLETE_UPDATE_PROFILE, SEND_MAIL_FOR_USER_VALID, WRONG_LOGIN_INFO } from "@/consts/responseConsts"
import { TEXT_VALID_MAIL, TITLE_VALID_MAIL } from "@/consts/mailConsts"
import { findUniqueUserAbsoluteExist, findUniqueProfileAbsoluteExist } from "@/services/prismaService"
import { CustomLogger, LoggingObjType, maskConfInfoInReqBody } from "@/services/LoggerService"
import { PROCESS_FAILURE, PROCESS_SUCCESS, UNSPECIFIED_USER_ID } from "@/consts/logConsts"
import { ErrorHandleIncludeDbRecordNotFound, internalServerErrorHandle } from "@/services/errorHandlingService"
const logger = new CustomLogger()

/**
 * 認証前アカウントを作成し、認証メールを送信する
 * emailは各ユーザーでユニークになる
 * @param req email, password, name
 * @param res
 * @param next
 * @returns
 */
export const registUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body

    // logのために関数名を取得
    const currentFuncName = registUser.name
    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // emailでユーザーを取得
        const user = await customizedPrisma.user.findUnique({
            where: {
                email: email
            }
        })
        // ユーザーが存在していたら400エラー
        if (user) {
            const HttpStatus = 400
            const responseStatus = false
            const responseMsg = ALREADY_USED_MAILADDLESS.message
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

        // 認証トークン作成
        const authCode = randomBytes(32).toString("hex")

        // ユーザー作成
        const newUser = await customizedPrisma.user.create({
            data: {
                email,
                password,
                name,
                authCode,
            }
        })
        // プロフィール作成
        await customizedPrisma.profile.create({
            data: {
                userId: newUser.id
            }
        })

        // メール送信
        const verifyUrl = `${process.env.BASE_URL}/users/${newUser.id}/verify/${newUser.authCode}`
        await sendVerifyMail(email, verifyUrl)

        // レスポンスを返却
        const HttpStatus = 201
        const responseStatus = true
        const responseMsg = SEND_MAIL_FOR_USER_VALID.message
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
        internalServerErrorHandle(e, UNSPECIFIED_USER_ID.message, req, res, currentFuncName)
    }
}

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
 * メールアドレス、パスワードでログイン認証
 * @param req email, password
 * @param res
 * @param next
 * @returns
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す
    const { email, password } = req.body

    // logのために関数名を取得
    const currentFuncName = login.name
    try {
        // emailが一致するユーザーを取得
        const whereByEmail = { email }
        const user = await findUniqueUserAbsoluteExist(whereByEmail, res)
        const userId = user.id

        // パスワードを比較
        const isValidPassword = await compare(password, user.password)
        // 合致しなかったら401エラー
        if (!isValidPassword) {
            // レスポンスを返却
            const HttpStatus = 401
            const responseStatus = false
            const responseMsg = WRONG_LOGIN_INFO.message
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)

            // TODO: email, passwordをマスクする
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
            logger.error(PROCESS_FAILURE.message(currentFuncName), logBody)

            return
        }

        // メールアドレス認証が行われていない場合、認証メールを送信し処理終了
        if (!user.verified) {
            // 認証トークン
            let token

            // tokenが無かったら新たに発行してDBに記録
            if (!user.authCode) {
                const newToken = randomBytes(32).toString("hex");

                // DBに記録
                await customizedPrisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        authCode: newToken
                    }
                })

                // tokenを新たに生成したものに。
                token = newToken
            } else {
                token = user.authCode
            }

            // メール送信
            const verifyUrl = `${process.env.BASE_URL}/users/${userId}/verify/${token}`
            await sendVerifyMail(email, verifyUrl)

            // レスポンスを返却
            const HttpStatus = 201
            const responseStatus = true
            const responseMsg = SEND_MAIL_FOR_USER_VALID.message
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg)

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

            return
        }

        // jwt発行
        const jwt = generateAuthToken(userId);

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = COMPLETE_LOGIN.message
        res.status(HttpStatus).json({
            "status": responseStatus,
            "token": jwt,
            "message": responseMsg,
        });

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
        ErrorHandleIncludeDbRecordNotFound(e, UNSPECIFIED_USER_ID.message, req, res, currentFuncName)
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
 * ユーザーのプロフィールを取得
 * tokenのuserIdからユーザーから取得
 * @param req userId
 * @param res id, createdAt, updatedAt, sex, weight, height, birthday, userId
 * @param next
 * @returns
 */
export const readProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body

    // logのために関数名を取得
    const currentFuncName = readProfile.name
    try {
        // userIdでプロフィールを取得
        const whereByUserId = { userId: userId }
        const profile = await findUniqueProfileAbsoluteExist(whereByUserId, res)

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = COMPLETE_GET_PROFILE.message
        basicHttpResponceIncludeData(res, HttpStatus, responseStatus, responseMsg, profile)

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
        ErrorHandleIncludeDbRecordNotFound(e, userId.message, req, res, currentFuncName)
    }
}

/**
 * ユーザーのプロフィール編集
 * tokenのuserIdからユーザーのプロフィールを編集
 * @param req userId, sex, height, birthday
 * @param res
 * @param next
 */
export const editProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, sex, height, birthday } = req.body

    // logのために関数名を取得
    const currentFuncName = editProfile.name
    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // userIdでプロフィールを検索
        const whereByUserId = { userId }
        await findUniqueProfileAbsoluteExist(whereByUserId, res)

        // プロフィールを更新
        const updatedProfile = await customizedPrisma.profile.update({
            where: whereByUserId,
            data: {
                sex,
                height,
                birthday
            }
        })

        // レスポンスを返却
        const HttpStatus = 200
        const responseStatus = true
        const responseMsg = COMPLETE_UPDATE_PROFILE.message
        basicHttpResponceIncludeData(res, HttpStatus, responseStatus, responseMsg, updatedProfile)

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
        ErrorHandleIncludeDbRecordNotFound(e, userId.message, req, res, currentFuncName)
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
 * 認証確認用のメールを送信する。
 * @param email 送信先メールアドレス
 * @param url 認証用URL
 */
const sendVerifyMail = async (email: string, url: string) => {
    // 件名
    const mailSubject = TITLE_VALID_MAIL.message
    // 本文
    const text = TEXT_VALID_MAIL.message(url)
    await sendMail(email, mailSubject, text)
}
