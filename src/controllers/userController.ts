import type { Request, Response, NextFunction } from "express"
import { hashedPassHookprisma } from "../services/prismaMiddleware/index"
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const registUser = async (req:Request, res:Response, next:NextFunction) => {
    const { email, password, name } = req.body

    try {
        // emailが被ってるか確認
        const result = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        // 被っていたら400エラー
        if (result) {
            return res.status(400).json({ msg: 'すでにそのメールアドレスは使用されています。' })
        }

        // ユーザー作成
        await hashedPassHookprisma.user.create({
            data: {
                email: email,
                password: password,
                name: name,
                authCode: 'hoge', // TODO: 仮
            }
        })

        // レスポンス
        res.status(200).json({
            "status": true,
            "message": "ユーザーの作成が完了しました",
        });
    } catch (e) {
        // エラーの時のレスポンス
        res.status(500).json({
            "status": false,
            "message": e,
        });
    }
}