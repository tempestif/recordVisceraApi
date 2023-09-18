import { TOKEN_NOT_DISCREPANCY, TOKEN_NOT_FOUND } from "@/consts/responseConsts";
import type { Request, Response, NextFunction } from "express"
import { verify } from "jsonwebtoken"
import type { JwtPayload } from "jsonwebtoken"
import { basicResponce } from "./utilResponseService";
import { findUniqueUserAbsoluteExist } from "./prismaService";

/**
 * トークン認証
 * ログイン済のユーザーのみにしかみれないページにミドルウェアとして使う
 * x-auth-tokenという名前でheaderからtokenを取得する。
 * jwtからデコードしたuserIdをbodyに追加する
 * デコードしたuserIdに該当するユーザーの存在チェックも行う。
 * 存在しない場合400エラー
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
    //トークン認証
    const jwt = req.header("x-auth-token");

    // tokenがない場合、400エラー
    if (!jwt) {
        const HttpStatus = 400
        const responseStatus = false
        const responseMsg = TOKEN_NOT_FOUND.message
        return basicResponce(res, HttpStatus, responseStatus, responseMsg)
    }

    // PrivateKeyがないときはエラー
    const privateKey = process.env.JWTPRIVATEKEY
    if (!privateKey) {
        throw new Error("auth: 環境変数が足りません");
    }

    try {
        // tokenをデコード
        const decoded = await verify(jwt, privateKey) as JwtPayload

        // userの有無を確認
        const user = await findUniqueUserAbsoluteExist({ id: decoded.id }, res)

        if (user) {
            // reqのbodyにuserIdを追加
            req.body.userId = decoded.id
            next();
        } else {
            throw Error
        }
    } catch {
        const HttpStatus = 400
        const responseStatus = false
        const responseMsg = TOKEN_NOT_DISCREPANCY.message
        return basicResponce(res, HttpStatus, responseStatus, responseMsg)
    }
};