import type { Request, Response, NextFunction } from "express"
import { hashedPassHookprisma, offsetTimePrisma } from "@/services/prismaMiddleware/index"
import { PrismaClient } from '@prisma/client'
import { sendMail } from "@/services/nodemailerService"
import { randomBytes } from "crypto"
import { compare } from "bcrypt"
import { generateAuthToken } from "@/services/jwtService"
import { basicResponce, internalServerErr } from "@/services/utilResponseService"
import { ALREADY_USED_MAILADDLESS, COMPLETE_GET_PROFILE, COMPLETE_LOGIN, COMPLETE_UPDATE_PROFILE, PROFILE_NOT_FOUND, SEND_MAIL_FOR_USER_VALID, USER_NOT_FOUND, WRONG_LOGIN_INFO } from "@/consts/responseConsts"
import { TEXT_VALID_MAIL, TITLE_VALID_MAIL } from "@/consts/mailConsts"
const prisma = new PrismaClient()

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

    // TODO: バリデーション

    try {
        // emailでユーザーを取得
        const result = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        // ユーザーが存在していたら400エラー
        if (result) {
            const HttpStatus = 400
            const responseStatus = false
            const responseMsg = ALREADY_USED_MAILADDLESS.message
            return basicResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // 認証トークン作成
        const authCode = randomBytes(32).toString("hex")

        // ユーザー作成
        const newUser = await hashedPassHookprisma.user.create({
            data: {
                email,
                password,
                name,
                authCode,
            }
        })
        // プロフィール作成
        await offsetTimePrisma.profile.create({
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
        basicResponce(res, HttpStatus, responseStatus, responseMsg)
    } catch (e) {
        // エラーの時のレスポンス
        internalServerErr(res, e)
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
    // TODO: バリデーション
    const { email, password } = req.body

    try {
        // emailが一致するユーザーを取得
        const user = await offsetTimePrisma.user.findUnique({
            where: {
                email: email
            }
        })
        // ユーザーが見つからなかったら401エラー
        if (!user) {
            const HttpStatus = 401
            const responseStatus = false
            const responseMsg = WRONG_LOGIN_INFO.message
            return basicResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // パスワードを比較
        const isValidPassword = await compare(password, user.password)
        // 合致しなかったら401エラー
        if (!isValidPassword) {
            const HttpStatus = 401
            const responseStatus = false
            const responseMsg = WRONG_LOGIN_INFO.message
            return basicResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // メールアドレス認証が行われていない場合、認証メールを送信し処理終了
        if (!user.verified) {
            // 認証トークン
            let token

            // tokenが無かったら新たに発行してDBに記録
            if (!user.authCode) {
                const newToken = randomBytes(32).toString("hex");

                // DBに記録
                await offsetTimePrisma.user.update({
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
            const verifyUrl = `${process.env.BASE_URL}/users/${user.id}/verify/${token}`
            await sendVerifyMail(email, verifyUrl)

            // レスポンスを返却
            const HttpStatus = 201
            const responseStatus = true
            const responseMsg = SEND_MAIL_FOR_USER_VALID.message
            return basicResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // jwt発行
        const jwt = generateAuthToken(user.id);
        // レスポンスを返却
        res.status(200).json({
            "status": true,
            "token": jwt,
            "message": COMPLETE_LOGIN.message,
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
    const { userId } = req.body

    try {
        // userIdでユーザーを取得
        const whereByUserId = { id: userId }
        const user = await offsetTimePrisma.user.findUnique({ where: whereByUserId })
        // ユーザーが見つからなかったら401エラー
        if (!user) {
            const HttpStatus = 401
            const responseStatus = false
            const responseMsg = USER_NOT_FOUND.message
            return basicResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // password, authCode, verified以外を返却する。
        const { id, email, name, createdAt, updatedAt } = user
        res.status(200).json({
            "status": true,
            "message": COMPLETE_GET_PROFILE.message,
            "data": {
                id,
                email,
                name,
                createdAt,
                updatedAt
            }
        });
    } catch (e) {
        internalServerErr(res, e)
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
export const readPrifile = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body

    try {
        // userIdでプロフィールを取得
        const whereByUserId = { userId: userId }
        const profile = await offsetTimePrisma.profile.findUnique({ where: whereByUserId })
        // プロフィールが見つからなかったら401エラー
        if (!profile) {
            const HttpStatus = 401
            const responseStatus = false
            const responseMsg = PROFILE_NOT_FOUND.message
            return basicResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // レスポンスを返却
        res.status(200).json({
            "status": true,
            "message": COMPLETE_GET_PROFILE.message,
            "data": profile
        });
    } catch (e) {
        internalServerErr(res, e)
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

    // TODO: バリデーション

    try {
        // userIdからプロフィール取得
        const whereByUserId = { userId: userId }
        const profile = await offsetTimePrisma.profile.findUnique({ where: whereByUserId })
        // プロフィールが見つからなかったら401エラー
        if (!profile) {
            const HttpStatus = 401
            const responseStatus = false
            const responseMsg = USER_NOT_FOUND.message
            return basicResponce(res, HttpStatus, responseStatus, responseMsg)
        }

        // プロフィールを更新
        const updatedProfile = await offsetTimePrisma.profile.update({
            where: whereByUserId,
            data: {
                sex,
                height,
                birthday
            }
        })

        res.status(200).json({
            "status": true,
            "message": COMPLETE_UPDATE_PROFILE.message,
            "data": updatedProfile
        });

    } catch (e) {
        internalServerErr(res, e)
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
