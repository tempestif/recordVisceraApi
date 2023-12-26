import {
    PROCESS_FAILURE,
    UNEXPECTED_ERROR,
    UNSPECIFIED_USER_ID_TYPE,
} from "@/consts/logConsts";
import { CustomLogger, LoggingObjType } from "./LoggerService";
import {
    DbRecordNotFoundError,
    MultipleActiveUserError,
    TokenNotFoundError,
} from "./prismaService";
import { basicHttpResponce, internalServerErr } from "./utilResponseService";
import { type Request, type Response } from "express";

const logger = new CustomLogger();

/**
 * インターナルサーバーエラー
 * 汎用
 * @param e
 * @param userId
 * @param req
 * @param res
 * @param funcName
 */
export const internalServerErrorHandle = (
    e: unknown,
    userId: number | UNSPECIFIED_USER_ID_TYPE,
    req: Request,
    res: Response,
    funcName: string
) => {
    const HttpStatus = 500;
    const logMsg = PROCESS_FAILURE.message(funcName);
    const sharedLogBody = {
        userId: userId,
        ipAddress: req.ip,
        method: req.method,
        path: req.originalUrl,
        body: req.body,
        status: String(HttpStatus),
    };
    if (e instanceof Error) {
        const responseMsg = e.message;
        // エラー時の処理
        const logBody: LoggingObjType = {
            ...sharedLogBody,
            responseMsg,
        };
        logger.error(logMsg, logBody);
        internalServerErr(res, e);
    } else {
        // Error型じゃないとき。
        const responseMsg = UNEXPECTED_ERROR.message;
        const logBody: LoggingObjType = {
            ...sharedLogBody,
            responseMsg,
        };
        logger.error(logMsg, logBody);
        internalServerErr(res, e);
    }
};

/**
 * DBから対象のレコードが見つからない
 * @param e
 * @param userId
 * @param req
 * @param res
 * @param funcName
 */
export const dbRecordNotFoundErrorHandle = (
    e: DbRecordNotFoundError,
    userId: number | UNSPECIFIED_USER_ID_TYPE,
    req: Request,
    res: Response,
    funcName: string
) => {
    // レコードが見つからなかったら401エラー
    const HttpStatus = 401;
    const responseStatus = false;
    const responseMsg = e.message;
    const logBody: LoggingObjType = {
        userId: userId,
        ipAddress: req.ip,
        method: req.method,
        path: req.originalUrl,
        body: req.body,
        status: String(HttpStatus),
        responseMsg,
    };
    logger.error(PROCESS_FAILURE.message(funcName), logBody);
    basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);
};

/**
 * アクティブユーザーが複数いる
 * @param e
 * @param userId
 * @param req
 * @param res
 * @param funcName
 */
export const multipleActiveUsersErrorHandle = (
    e: MultipleActiveUserError,
    userId: number | UNSPECIFIED_USER_ID_TYPE,
    req: Request,
    res: Response,
    funcName: string
) => {
    // ユニークな条件でユーザーが複数取れたら500エラー
    // ((サーバー内部の問題は500で返すから
    const HttpStatus = 500;
    const responseStatus = false;
    const responseMsg = e.message;
    const logBody: LoggingObjType = {
        userId: userId,
        ipAddress: req.ip,
        method: req.method,
        path: req.originalUrl,
        body: req.body,
        status: String(HttpStatus),
        responseMsg,
    };
    logger.error(PROCESS_FAILURE.message(funcName), logBody);
    basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);
};

/**
 * 認証トークンが見つからない
 * @param e
 * @param userId
 * @param req
 * @param res
 * @param funcName
 */
export const tokenNotFoundErrorHandle = (
    e: TokenNotFoundError,
    userId: number | UNSPECIFIED_USER_ID_TYPE,
    req: Request,
    res: Response,
    funcName: string
) => {
    const HttpStatus = 400;
    const responseStatus = false;
    const responseMsg = e.message;
    const logBody: LoggingObjType = {
        userId: userId,
        ipAddress: req.ip,
        method: req.method,
        path: req.originalUrl,
        body: req.body,
        status: String(HttpStatus),
        responseMsg,
    };
    logger.error(PROCESS_FAILURE.message(funcName), logBody);
    basicHttpResponce(res, HttpStatus, responseStatus, responseMsg);
};

/**
 * エラーハンドラー
 * 各エラーハンドルをここに集約
 * @param e
 * @param userId
 * @param req
 * @param res
 * @param funcName
 */
export const errorResponseHandler = (
    e: unknown,
    userId: number | UNSPECIFIED_USER_ID_TYPE,
    req: Request,
    res: Response,
    funcName: string
) => {
    if (e instanceof DbRecordNotFoundError) {
        dbRecordNotFoundErrorHandle(e, userId, req, res, funcName);
    } else if (e instanceof MultipleActiveUserError) {
        multipleActiveUsersErrorHandle(e, userId, req, res, funcName);
    } else if (e instanceof TokenNotFoundError) {
        tokenNotFoundErrorHandle(e, userId, req, res, funcName);
    } else {
        internalServerErrorHandle(e, userId, req, res, funcName);
    }
};
