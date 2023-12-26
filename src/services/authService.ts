import {
    TOKEN_NOT_DISCREPANCY,
    TOKEN_NOT_FOUND,
} from "@/consts/responseConsts";
import type { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { basicHttpResponce } from "./utilResponseService";
import { findUniqueUserAbsoluteExist } from "./prismaService";
import { USER_LOGIN_STATUS } from "@/consts/db";
import { customizedPrisma } from "./prismaClients";
import { errorResponseHandler } from "./errorHandlingService";
import { Prisma } from "@prisma/client";
import { UNSPECIFIED_USER_ID } from "@/consts/logConsts";

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
    const funcName = auth.name;
    //トークン認証
    const jwt = req.header("x-auth-token");

    // tokenがない場合、400エラー
    if (!jwt) {
        const HttpStatus = 400;
        const responseStatus = false;
        const responseMsg = TOKEN_NOT_FOUND.message;
        return basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);
    }

    // PrivateKeyがないときはエラー
    const privateKey = process.env.JWTPRIVATEKEY;
    if (!privateKey) {
        throw new Error("auth: 環境変数が足りません");
    }

    let userId: string = UNSPECIFIED_USER_ID.message;

    try {
        // tokenをデコード
        const decoded = (await verify(jwt, privateKey)) as JwtPayload;

        // userの有無を確認
        const user = await findUniqueUserAbsoluteExist(
            { id: decoded.id },
            customizedPrisma
        );
        userId = String(user.id);

        // ログアウトまたは退会済みの場合、400エラー
        if (
            user.loginStatus === USER_LOGIN_STATUS.logout ||
            user.loginStatus === USER_LOGIN_STATUS.deactived
        ) {
            const HttpStatus = 400;
            const responseStatus = false;
            const responseMsg = TOKEN_NOT_DISCREPANCY.message
            return basicHttpResponce(
                res,
                HttpStatus,
                responseStatus,
                responseMsg
            );
        }

        // reqのbodyにuserIdを追加
        req.body.userId = decoded.id;
        next();
    } catch (e) {
        errorResponseHandler(
            e,
            UNSPECIFIED_USER_ID.message,
            req,
            res,
            funcName
        );
    }
};
