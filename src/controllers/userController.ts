import type { Request, Response, NextFunction } from "express"
import { hashedPassHookprisma, offsetTimePrisma } from "../services/prismaMiddleware/index"
import { PrismaClient } from '@prisma/client'
import { sendMail } from "../services/nodemailerService"
import { randomBytes } from "crypto"
import { compare } from "bcrypt"
import { generateAuthToken } from "../services/jwtService"
import { internalServerErr } from "../services/utilResponseService"
const prisma = new PrismaClient()

/**
 * アカウント作成
 * @param req email, password, name
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

        // レスポンス
        res.status(201).json({
            "status": true,
            "message": "ユーザー認証のためのメールが送信されました。", // NOTE: 固定文言
        });
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
 * ログイン認証
 * @param req email, password
 * @param res
 * @param next
 * @returns
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: バリデーション
    const { email, password } = req.body

    try {
        // emailからユーザーの存在確認
        const user = await offsetTimePrisma.user.findUnique({
            where: {
                email: email
            }
        })
        // ユーザーが見つからなかったら401エラー
        if (!user) {
            return res.status(401).json({
                "status": false,
                "message": "メールアドレス、またはパスワードが違います。", // NOTE: 固定文言
            });
        }

        // パスワードを比較
        const isValidPassword = await compare(password, user.password)
        // 合致しなかったら401エラー
        if (!isValidPassword) {
            return res.status(401).json({
                "status": false,
                "message": "メールアドレス、またはパスワードが違います。", // NOTE: 固定文言
            });
        }

        // メールアドレス認証が行われていない場合、認証メールを送信
        if (!user.verified) {
            // 現在のユーザーの認証トークン
            let token = user.authCode

            // tokenが無かったら新たに発行してDBに記録
            if (!token) {
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
            }

            // メール送信
            const verifyUrl = `${process.env.BASE_URL}/users/${user.id}/verify/${token}`
            await sendVerifyMail(email, verifyUrl)

            // レスポンス
            return res.status(201).json({
                "status": true,
                "message": "ユーザー認証のためのメールが送信されました。", // NOTE: 固定文言
            });
        }

        // token発行
        const token = generateAuthToken(user.id);
        // レスポンス
        res.status(200).json({
            "status": true,
            "token": token,
            "message": "ログインが完了しました。", // NOTE: 固定文言
        });
    } catch (e) {
        // エラーの時のレスポンス
        internalServerErr(res, e)
    }
}

/**
 * プロフィール編集
 * @param req userId, sex, height, birthday
 * @param res
 * @param next
 */
export const editProfile = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, sex, height, birthday } = req.body

    // TODO: バリデーション

    try {
        // userIdでユーザーを検索
        const whereByUserId = { userId: userId }

        // ユーザー取得
        const user = await offsetTimePrisma.profile.findUnique({ where: whereByUserId })
        // ユーザーが見つからなかったら401エラー
        if (!user) {
            return res.status(401).json({
                "status": false,
                "message": "ユーザーが見つかりません。", // NOTE: 固定文言
            });
        }

        // DBに記録
        await offsetTimePrisma.profile.update({
            where: whereByUserId,
            data: {
                sex,
                height,
                birthday
            }
        })

        // レスポンス
        res.status(200).json({
            "status": true,
            "message": "プロフィールを更新しました。", // NOTE: 固定文言
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
    const mailSubject = "[recordViscera]メールアドレス認証" // NOTE: 固定文言
    // 本文
    const text = `以下のURLをクリックしてください\n登録されたメールアドレスを確認します。\n${url}` // NOTE: 固定文言
    await sendMail(email, mailSubject, text)
}
