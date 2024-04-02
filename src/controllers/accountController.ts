import { USER_LOGIN_STATUS } from "@/consts/db";
import {
    UNSPECIFIED_USER_ID,
    PROCESS_FAILURE,
    PROCESS_SUCCESS,
} from "@/consts/logConsts";
import {
    ALREADY_USED_MAILADDLESS,
    SEND_MAIL_FOR_USER_VALID,
    WRONG_LOGIN_INFO,
    COMPLETE_LOGIN,
    COMPLETE_LOOUT,
    MULTIPLE_ACTIVE_USERS,
} from "@/consts/responseConsts";
import {
    LoggingObjType,
    logResponse,
    maskConfInfoInReqBody,
} from "@/services/logger/loggerService";
import { errorResponseHandler } from "@/services/errorHandle";
import { generateAuthToken } from "@/services/jwtService";
import { customizedPrisma } from "@/services/prismaClients";
import {
    MultipleActiveUserError,
    findActivedUser,
} from "@/services/prismaService";
import { basicHttpResponce } from "@/services/utilResponseService";
import { compare } from "bcrypt";
import { randomBytes } from "crypto";
import { type Request, type Response, type NextFunction } from "express";
import { CustomLogger } from "@/services/logger/loggerClass";
import { sendMailForEmailVerify } from "@/services/prismaService/account";
const logger = new CustomLogger();
/**
 * 認証前アカウントを作成し、認証メールを送信する
 * emailは各ユーザーでユニークになる
 * @param req email, password, name
 * @param res
 * @param next
 * @returns
 */
export const registUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password, name } = req.body;

    // logのために関数名を取得
    const currentFuncName = registUser.name;
    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す

    try {
        // emailでユーザーを取得
        const users = await customizedPrisma.user.findMany({
            where: {
                email: email,
            },
        });
        // ユーザーが存在 && 全てのユーザーが退会済じゃない場合400エラー
        if (users.length) {
            for (const user of users) {
                if (user.loginStatus !== USER_LOGIN_STATUS.deactived) {
                    const httpStatus = 400;
                    const responseStatus = false;
                    const responseMsg = ALREADY_USED_MAILADDLESS.message;
                    basicHttpResponce(
                        res,
                        httpStatus,
                        responseStatus,
                        responseMsg
                    );

                    // ログを出力
                    const logBody: LoggingObjType = {
                        userId: UNSPECIFIED_USER_ID.message,
                        ipAddress: req.ip,
                        method: req.method,
                        path: req.originalUrl,
                        body: maskConfInfoInReqBody(req).body,
                        status: String(httpStatus),
                        responseMsg,
                    };
                    logger.error(
                        PROCESS_FAILURE.message(currentFuncName),
                        logBody
                    );
                    return;
                }
            }
        }

        // 認証トークン作成
        // TODO: serviceに関数作る
        const verifyEmailHash = randomBytes(32).toString("hex");

        // ユーザー作成
        const newUser = await customizedPrisma.user.create({
            data: {
                email,
                password,
                name,
                verifyEmailHash,
            },
        });
        // プロフィール作成
        await customizedPrisma.profile.create({
            data: {
                userId: newUser.id,
            },
        });

        // メール送信
        // TODO: ここはフロント側のページのURLを送信するべき。フロントを実装したら修正する。
        const verifyUrl = `${process.env.BASE_URL}/users/${newUser.id}/verify/${newUser.verifyEmailHash}`;
        await sendMailForEmailVerify(email, verifyUrl);

        // レスポンスを返却
        const httpStatus = 201;
        const responseStatus = true;
        const responseMsg = SEND_MAIL_FOR_USER_VALID.message;
        basicHttpResponce(res, httpStatus, responseStatus, responseMsg);

        // ログを出力
        logResponse(
            UNSPECIFIED_USER_ID.message,
            req,
            httpStatus,
            responseMsg,
            currentFuncName
        );
    } catch (e) {
        errorResponseHandler(
            e,
            UNSPECIFIED_USER_ID.message,
            req,
            res,
            currentFuncName
        );
    }
};

/**
 * メールアドレス、パスワードでログイン認証
 * @param req email, password
 * @param res
 * @param next
 * @returns
 */
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // TODO: バリデーション バリデーションエラーは詳細にエラーを返す
    const { email, password } = req.body;

    // logのために関数名を取得
    const currentFuncName = login.name;
    try {
        // emailが一致するユーザーを取得
        const whereByEmail = { email };
        const users = await findActivedUser(whereByEmail, customizedPrisma);

        // 同じemailのユーザーが複数取れたら500エラー
        // サーバー内部の問題は500で返すらしい
        if (users.length !== 1) {
            throw new MultipleActiveUserError(MULTIPLE_ACTIVE_USERS.message);
        }
        const user = users[0];
        const userId = user.id;

        // パスワードを比較
        const isValidPassword = await compare(password, user.password);
        // 合致しなかったら401エラー
        if (!isValidPassword) {
            // TODO: これもエラークラスにして、throwだけにしたい。
            // レスポンスを返却
            const httpStatus = 401;
            const responseStatus = false;
            const responseMsg = WRONG_LOGIN_INFO.message;
            basicHttpResponce(res, httpStatus, responseStatus, responseMsg);

            // TODO: email, passwordをマスクする
            // ログを出力
            const logBody: LoggingObjType = {
                userId: userId,
                ipAddress: req.ip,
                method: req.method,
                path: req.originalUrl,
                body: maskConfInfoInReqBody(req).body,
                status: String(httpStatus),
                responseMsg,
            };
            logger.error(PROCESS_FAILURE.message(currentFuncName), logBody);

            return;
        }

        // メールアドレス認証が行われていない場合、認証メールを送信し処理終了
        if (!user.verified) {
            // 認証トークン
            let token;

            // tokenが無かったら新たに発行してDBに記録
            if (!user.verifyEmailHash) {
                const newToken = randomBytes(32).toString("hex");

                // DBに記録
                await customizedPrisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        verifyEmailHash: newToken,
                    },
                });

                // tokenを新たに生成したものに。
                token = newToken;
            } else {
                token = user.verifyEmailHash;
            }

            // メール送信
            const verifyUrl = `${process.env.BASE_URL}/users/${userId}/verify/${token}`;
            await sendMailForEmailVerify(email, verifyUrl);

            // レスポンスを返却
            const httpStatus = 201;
            const responseStatus = true;
            const responseMsg = SEND_MAIL_FOR_USER_VALID.message;
            basicHttpResponce(res, httpStatus, responseStatus, responseMsg);

            // ログを出力
            const logBody: LoggingObjType = {
                userId: userId,
                ipAddress: req.ip,
                method: req.method,
                path: req.originalUrl,
                body: maskConfInfoInReqBody(req).body,
                status: String(httpStatus),
                responseMsg,
            };
            logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody);

            return;
        }

        // jwt発行
        const jwt = generateAuthToken(userId);

        // loginStatusをloginに変更
        await customizedPrisma.user.update({
            where: {
                id: userId,
            },
            data: {
                loginStatus: USER_LOGIN_STATUS.login,
            },
        });

        // レスポンスを返却
        const httpStatus = 200;
        const responseStatus = true;
        const responseMsg = COMPLETE_LOGIN.message;
        res.status(httpStatus).json({
            status: responseStatus,
            token: jwt,
            message: responseMsg,
        });

        // ログを出力
        const logBody: LoggingObjType = {
            userId: userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(httpStatus),
            responseMsg,
        };
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody);
    } catch (e: unknown) {
        errorResponseHandler(
            e,
            UNSPECIFIED_USER_ID.message,
            req,
            res,
            currentFuncName
        );
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { userId } = req.body;
    const currentFuncName = logout.name;

    try {
        // loginStatusをlogoutに変更
        await customizedPrisma.user.update({
            where: {
                id: userId,
            },
            data: {
                loginStatus: USER_LOGIN_STATUS.logout,
            },
        });
        // レスポンスを返却
        const httpStatus = 200;
        const responseStatus = true;
        const responseMsg = COMPLETE_LOOUT.message;
        basicHttpResponce(res, httpStatus, responseStatus, responseMsg);

        // ログを出力
        const logBody: LoggingObjType = {
            userId: userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(httpStatus),
            responseMsg,
        };
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody);
    } catch (e: unknown) {
        errorResponseHandler(e, userId, req, res, currentFuncName);
    }
};
