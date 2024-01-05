import { type Request, type Response, type NextFunction } from "express";
import { customizedPrisma } from "@/services/prismaClients";
import { sendMail } from "@/services/nodemailerService";
import { compare } from "bcrypt";
import {
    basicHttpResponce,
    basicHttpResponceIncludeData,
    internalServerErr,
} from "@/services/utilResponseService";
import {
    COMPLETE_GET_PROFILE,
    COMPLETE_UPDATE_PASSWORD,
    DELETE_USER,
    WRONG_LOGIN_INFO,
} from "@/consts/responseConsts";
import { findUniqueUserAbsoluteExist } from "@/services/prismaService";
import {
    CustomLogger,
    LoggingObjType,
    maskConfInfoInReqBody,
} from "@/services/LoggerService";
import { PROCESS_FAILURE, PROCESS_SUCCESS } from "@/consts/logConsts";
import { errorResponseHandler } from "@/services/errorHandle";
import { USER_LOGIN_STATUS } from "@/consts/db";
import { Prisma } from "@prisma/client";
import { transformNameTableToModel } from "@/services/prismaService/format";
const logger = new CustomLogger();

/**
 * メール送信テスト
 * TODO: 本番前に消す
 */
export const sendMailTest = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // メールを送信
        const mail = process.env.MAIL_ACCOUNT ?? "";
        await sendMail(mail, "test", "test mail");

        // レスポンス
        res.status(200).json({
            status: true,
            message: "[テスト]メールを送信しました。",
        });
    } catch (e) {
        // エラーの時のレスポンス
        internalServerErr(res, e);
    }
};

/**
 * tokenのuserIdからユーザー情報を取得
 * @param req userId
 * @param res id, email, name, createdAt, updatedAt
 * @param next
 * @returns
 */
export const readUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // TODO: バリデーション
    const { userId } = req.body;

    // logのために関数名を取得
    const currentFuncName = readUser.name;
    try {
        // userIdでユーザーを取得
        const whereByUserId = { id: userId };
        const user = await findUniqueUserAbsoluteExist(
            whereByUserId,
            customizedPrisma
        );

        // レスポンスを返却
        const HttpStatus = 200;
        const responseStatus = true;
        const responseMsg = COMPLETE_GET_PROFILE.message;
        // password, authCode, verified以外を返却する。
        const { id, email, name, createdAt, updatedAt } = user;
        const respondUser = {
            id,
            email,
            name,
            createdAt,
            updatedAt,
        };
        basicHttpResponceIncludeData(
            res,
            HttpStatus,
            responseStatus,
            responseMsg,
            respondUser
        );

        // ログを出力
        const logBody: LoggingObjType = {
            userId: userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg,
        };
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody);
    } catch (e: unknown) {
        errorResponseHandler(e, userId, req, res, currentFuncName);
    }
};

const userInclude: Prisma.UserInclude = {
    Bowel_Movement: true,
    Profile: true,
    User_Medical_History: true,
    User_Setting: true,
    Daily_Report: true,
    Clinic_Report: true,
    Medication_Info_User: true,
    Medication_Schedule: true,
    Medication_Result: true,
};

/**
 * ユーザー削除
 * Userテーブルは論理削除、紐づくテーブルは物理削除
 * @param req
 * @param res
 * @param next
 */
export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { userId } = req.body;
    const currentFuncName = deleteUser.name;
    try {
        // userテーブルを論理削除
        const user = await customizedPrisma.user.update({
            where: {
                id: userId,
            },
            data: {
                loginStatus: USER_LOGIN_STATUS.deactived,
            },
            include: userInclude,
        });

        // userに紐づくテーブルを削除
        type AcceptedTableNames = keyof Prisma.$UserPayload["objects"];
        for (const table in userInclude) {
            const t = table as AcceptedTableNames;
            const prop = transformNameTableToModel(t);
            // 消すテーブルとのリレーションが1対多かどうか確認
            const includeTable = user[t];
            const isOneToMany = Array.isArray(includeTable);

            // 1対多の場合、配列内の全てのレコードを消す
            if (isOneToMany) {
                for (const record of includeTable) {
                    // @ts-ignore
                    await customizedPrisma[prop].delete({
                        // @ts-ignore
                        where: {
                            id: record.id,
                        },
                    });
                }
            } else if (includeTable) {
                // @ts-ignore
                await customizedPrisma[prop].delete({
                    // @ts-ignore
                    where: {
                        id: includeTable?.id,
                    },
                });
            }
        }

        // レスポンスを返却
        const HttpStatus = 200;
        const responseStatus = true;
        const responseMsg = DELETE_USER.message;
        basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);

        // ログを出力
        const logBody: LoggingObjType = {
            userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg,
        };
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody);
    } catch (e: unknown) {
        errorResponseHandler(e, userId, req, res, currentFuncName);
    }
};

/**
 * ユーザーパスワードを変更
 * 現在のパスワードが合致していたら新パスワードを更新
 * @param req
 * @param res
 * @param next
 */
export const changePassowrd = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { userId, oldPassword, newPassword } = req.body;

    // logのために関数名を取得
    const currentFuncName = changePassowrd.name;
    // TODO: バリデーション
    try {
        // userIdでユーザーを取得
        const whereByUserId = { id: userId };
        const user = await findUniqueUserAbsoluteExist(
            whereByUserId,
            customizedPrisma
        );

        // 旧パスワードの一致を確認
        const isValidPassword = await compare(oldPassword, user.password);
        // 合致しなかったら401エラー
        if (!isValidPassword) {
            const HttpStatus = 401;
            const responseStatus = false;
            const responseMsg = WRONG_LOGIN_INFO.message;
            basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);

            // ログを出力
            const logBody: LoggingObjType = {
                userId,
                ipAddress: req.ip,
                method: req.method,
                path: req.originalUrl,
                body: maskConfInfoInReqBody(req).body,
                status: String(HttpStatus),
                responseMsg,
            };
            logger.error(PROCESS_FAILURE.message(currentFuncName), logBody);

            return;
        }

        // パスワードを更新
        const newUser = await customizedPrisma.user.update({
            where: whereByUserId,
            data: {
                password: newPassword,
            },
        });

        // レスポンスを返却
        const HttpStatus = 200;
        const responseStatus = true;
        const responseMsg = COMPLETE_UPDATE_PASSWORD.message;
        const { id, email, name, createdAt, updatedAt } = newUser;
        const respondUser = {
            id,
            email,
            name,
            createdAt,
            updatedAt,
        };
        basicHttpResponceIncludeData(
            res,
            HttpStatus,
            responseStatus,
            responseMsg,
            respondUser
        );

        // ログを出力
        const logBody: LoggingObjType = {
            userId,
            ipAddress: req.ip,
            method: req.method,
            path: req.originalUrl,
            body: maskConfInfoInReqBody(req).body,
            status: String(HttpStatus),
            responseMsg,
        };
        logger.log(PROCESS_SUCCESS.message(currentFuncName), logBody);
    } catch (e) {
        errorResponseHandler(e, userId, req, res, currentFuncName);
    }
};
