import { internalServerErr } from "../services/utilResponseService";
import { offsetTimePrisma } from "../services/prismaMiddleware";
import { Request, Response, NextFunction } from "express";

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
                "message": "ユーザーが見つかりませんでした。", // NOTE: 固定文言
            });
        }

        // tokenが見つからなかったら400エラー
        if (!user.authCode) {
            return res.status(400).json({
                "status": false,
                "message": "tokenが見つかりませんでした。", // NOTE: 固定文言
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
            "message": "メールアドレスの認証が完了しました。", // NOTE: 固定文言
        });
    } catch (e) {
        // エラーの時のレスポンス
        internalServerErr(res, e)
    }
}
