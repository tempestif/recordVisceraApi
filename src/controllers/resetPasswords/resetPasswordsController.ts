import {
    UNSPECIFIED_USER_ID,
} from "@/consts/logConsts";
import {
    TITLE_VALID_RESET_PASS,
    TEXT_VALID_RESET_PASS,
} from "@/consts/mailConsts";
import {
    COMPLETE_VALID_RESET_PASS,
    MULTIPLE_ACTIVE_USERS,
    SEND_MAIL_FOR_RESET_PASS_VALID,
    TOKEN_NOT_FOUND,
} from "@/consts/responseConsts";
import {
    logError,
    logResponse,
} from "@/services/logger/loggerService";
import { errorResponseHandler } from "@/services/errorHandle";
import { sendMail } from "@/services/nodemailerService";
import { customizedPrisma } from "@/services/prismaClients";
import {
    MultipleActiveUserError,
    findActivedUser,
    findUniqueUserAbsoluteExist,
} from "@/services/prismaService";
import { basicHttpResponce } from "@/services/utilResponseService";
import { randomBytes } from "crypto";
import type { Request, Response, NextFunction } from "express";

/**
 * パスワード再設定のリクエストを行う
 * トークンを生成してurlをメール送信する。
 * @param req
 * @param res
 * @param next
 */
export const requestResettingPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email } = req.body;

    // logのために関数名を取得
    const currentFuncName = requestResettingPassword.name;
    // TODO: バリデーション

    try {
        // emailからuserを取得
        const whereByEmail = { email };
        const users = await findActivedUser(whereByEmail, customizedPrisma);
        if (users.length !== 0) {
            throw new MultipleActiveUserError(MULTIPLE_ACTIVE_USERS.message);
        }

        const user = users[0];

        // 認証トークン作成
        const passResetHash = randomBytes(32).toString("hex");

        // DBに保存
        const newUser = await customizedPrisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                passResetHash,
            },
        });

        // メール送信
        // TODO: メールにはフロント(クライアント)のURLを載せたい。これはAPIのURI。
        const verifyUrl = `${process.env.BASE_URL}/reset-password/${newUser.id}/execute/${newUser.passResetHash}`;
        await sendMailForResetPasswordVerify(email, verifyUrl);

        // レスポンスを返却
        const HttpStatus = 201;
        const responseStatus = true;
        const responseMsg = SEND_MAIL_FOR_RESET_PASS_VALID.message;
        basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);

        // ログを出力
        logResponse(
            UNSPECIFIED_USER_ID.message,
            req,
            HttpStatus,
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
 * パスワード再設定を実行する
 * paramのid, tokenを用いて認証、bodyの新パスワードに更新
 * Baseurl/reset-password/:id/execute/:token
 * @param req
 * @param res
 * @param next
 */
export const ExecuteResettingPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const id = Number(req.body.id);
    const { token, newPassword } = req.body;

    // logのために関数名を取得
    const currentFuncName = ExecuteResettingPassword.name;

    // TODO: バリデーション

    try {
        // idからユーザーを検索
        const whereByUserId = { id };
        const user = await findUniqueUserAbsoluteExist(
            whereByUserId,
            customizedPrisma
        );

        // tokenが見つからなかったら400エラー
        if (!user.passResetHash) {
            const HttpStatus = 400;
            const responseStatus = false;
            const responseMsg = TOKEN_NOT_FOUND.message;
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);

            // ログを出力
            logError(
                UNSPECIFIED_USER_ID.message,
                req,
                HttpStatus,
                responseMsg,
                currentFuncName
            );
            return;
        }

        // tokenが一致していたらパスワードを更新
        if (user.passResetHash === token) {
            await customizedPrisma.user.update({
                where: whereByUserId,
                data: {
                    passResetHash: "",
                    password: newPassword,
                },
            });
        }

        // レスポンス
        const HttpStatus = 200;
        const responseStatus = true;
        const responseMsg = COMPLETE_VALID_RESET_PASS.message;
        basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);

        // ログを出力
        logResponse(
            UNSPECIFIED_USER_ID.message,
            req,
            HttpStatus,
            responseMsg,
            currentFuncName
        );
    } catch (e) {
        // エラーの時のレスポンス
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
 * email認証確認用のメールを送信する。
 * @param email 送信先メールアドレス
 * @param url 認証用URL
 */
export const sendMailForResetPasswordVerify = async (
    email: string,
    url: string
) => {
    // 件名
    const mailSubject = TITLE_VALID_RESET_PASS.message;
    // 本文
    const text = TEXT_VALID_RESET_PASS.message(url);
    await sendMail(email, mailSubject, text);
};
