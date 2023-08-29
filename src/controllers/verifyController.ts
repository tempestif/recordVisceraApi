import { internalServerErr } from "@/services/utilResponseService";
import { offsetTimePrisma } from "@/services/prismaMiddleware";
import type { Request, Response, NextFunction } from "express";
import { COMPLETE_VALID_MAILADDRESS, NOT_FOUND_USER, TOKEN_NOT_FOUND } from "@/consts/responseConsts";

/**
 * メールアドレス認証
 */
export const verifyMailadress = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id)
    const token = req.params.token

    try {
        // idからユーザーを検索
        const user = await offsetTimePrisma.user.findUnique({
            where: {
                id: id
            }
        })

        // ユーザーが見つからなかったら400エラー
        if (!user) {
            return res.status(400).json({
                "status": false,
                "message": NOT_FOUND_USER.message,
            });
        }

        // tokenが見つからなかったら400エラー
        if (!user.authCode) {
            return res.status(400).json({
                "status": false,
                "message": TOKEN_NOT_FOUND.message,
            });
        }

        // tokenが一致していたらuserのverifiedを2にする
        if (user.authCode === token) {
            await offsetTimePrisma.user.update({
                where: {
                    id: id
                },
                data: {
                    authCode: "",
                    verified: 2 // NOTE: これもどっかに変数として置いときたいな。
                }
            })
        }

        // レスポンス
        res.status(200).json({
            "status": true,
            "message": COMPLETE_VALID_MAILADDRESS.message,
        });
    } catch (e) {
        // エラーの時のレスポンス
        internalServerErr(res, e)
    }
}
