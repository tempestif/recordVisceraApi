import type { Request, Response, NextFunction } from "express"
import { verify } from "jsonwebtoken"
import type { JwtPayload } from "jsonwebtoken"

/**
 * トークン認証
 * ログイン済のユーザーのみにしかみれないページにミドルウェアとして使う
 * x-auth-tokenという名前でheaderからtokenを取得する。
 * tokenより、userIdをbodyに追加する
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
    //トークン認証
    const token = req.header("x-auth-token");

    // tokenがない場合、400エラー
    if (!token) {
        return res.status(400).json({ msg: 'トークンが見つかりません' })
    }

    // PrivateKeyがないときはエラー
    const privateKey = process.env.JWTPRIVATEKEY
    if (!privateKey) {
        throw new Error("auth: 環境変数が足りません");
    }

    try {
        // tokenをデコード
        const decoded = await verify(token, privateKey) as JwtPayload

        // reqのbodyにuserIdを追加
        req.body.userId = decoded.id
        next();
    } catch {
        return res.status(400).json({
            errors: [
                {
                    msg: "トークンが一致しません",
                },
            ],
        });
    }
};