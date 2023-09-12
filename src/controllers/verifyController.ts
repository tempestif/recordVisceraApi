import { internalServerErr } from "@/services/utilResponseService";
import { customizedPrisma } from "@/services/prismaClients";
import type { Request, Response, NextFunction } from "express";
import { COMPLETE_VALID_MAILADDRESS, USER_NOT_FOUND, TOKEN_NOT_FOUND } from "@/consts/responseConsts";
import { USER_VARIFIED } from "@/consts/db";

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

    try {
        // idからユーザーを検索
        const user = await customizedPrisma.user.findUnique({
            where: { id }
        })

        // ユーザーが見つからなかったら400エラー
        if (!user) {
            return res.status(400).json({
                "status": false,
                "message": USER_NOT_FOUND.message,
            });
        }

        // tokenが見つからなかったら400エラー
        if (!user.authCode) {
            return res.status(400).json({
                "status": false,
                "message": TOKEN_NOT_FOUND.message,
            });
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
        res.status(200).json({
            "status": true,
            "message": COMPLETE_VALID_MAILADDRESS.message,
        });
    } catch (e) {
        // エラーの時のレスポンス
        internalServerErr(res, e)
    }
}
