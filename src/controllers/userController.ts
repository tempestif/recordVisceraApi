import type { Request, Response, NextFunction } from "express"
import { hashedPassHookprisma } from "../services/prismaMiddleware/index"
import { PrismaClient } from '@prisma/client'
import { sendMail } from "../services/nodemailerService"
import { randomBytes } from "crypto"
const prisma = new PrismaClient()

/**
 * アカウント作成
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const registUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body

    // TODO: バリデーション

    try {
        // emailが被ってるか確認
        const result = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        // 被っていたら400エラー
        if (result) {
            return res.status(400).json({ msg: 'すでにそのメールアドレスは使用されています。' }) // NOTE: 固定文言
        }

        // 認証トークン作成
        const authToken = randomBytes(32).toString("hex")

        // ユーザー作成
        const newUser = await hashedPassHookprisma.user.create({
            data: {
                email: email,
                password: password,
                name: name,
                authCode: authToken,
            }
        })

        // メール送信
        const verifyUrl = `${process.env.BASE_URL}/users/${newUser.id}/verify/${newUser.authCode}`
        const mailSubject = "[recordViscera]メールアドレス認証"
        const text = `以下のURLをクリックしてください\n登録されたメールアドレスを確認します。\n${verifyUrl}` // NOTE: 固定文言
        await sendMail(email, mailSubject, text)

        // レスポンス
        res.status(201).json({
            "status": true,
            "message": "ユーザー認証のためのメールが送信されました。", // NOTE: 固定文言
        });
    } catch (e) {
        // エラーの時のレスポンス
        res.status(500).json({
            "status": false,
            "message": e, // TODO: 本番環境では固定文言に変更
        });
    }
}

/**
 * メール送信テスト
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
        res.status(500).json({
            "status": false,
            "message": e, // TODO: 本番環境では固定文言に変更
        });
    }
}