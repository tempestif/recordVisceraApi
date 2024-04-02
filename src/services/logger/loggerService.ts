import {
    PROCESS_FAILURE,
    PROCESS_SUCCESS,
    UNSPECIFIED_USER_ID_TYPE,
} from "@/consts/logConsts";
import { Request } from "express";
import { CustomLogger } from "@/services/logger/loggerClass";

export type LoggingObjType = {
    userId: number | UNSPECIFIED_USER_ID_TYPE;
    ipAddress: string;
    method: string;
    path: string;
    body: string;
    status: string;
    responseMsg: string;
};

type LoggedUserIdType = number | UNSPECIFIED_USER_ID_TYPE;

const CONF_INFO_NAMES = ["email", "password"];

/**
 * 個人情報をマスクしたオブジェクトを作成する
 * HTTP Requestのオブジェクトを匿名化するために利用
 * 再帰的に呼び出し、ネストしていても匿名化されるようになっている
 * @param object
 * @returns
 */
export const maskConfInfoInReqBody = (object: { [key: string]: any }) => {
    Object.keys(object).forEach((key) => {
        CONF_INFO_NAMES.forEach((conf) => {
            if (key === conf) {
                object[key] = "****";
            }
        });

        if (typeof object[key] === "object" && object[key] !== null) {
            object[key] = maskConfInfoInReqBody(object[key]);
        }
    });

    return object;
};

/**
 * エラーが発生した際のログを出力する
 * @param responseMsg
 * @param userId
 * @param req
 * @param httpStatus
 * @param funcName
 */
export const logError = (
    userId: LoggedUserIdType,
    req: Request,
    httpStatus: number,
    responseMsg: string,
    funcName: string
) => {
    const logger = new CustomLogger();
    const logBody: LoggingObjType = {
        userId: userId,
        ipAddress: req.ip,
        method: req.method,
        path: req.originalUrl,
        body: req.body,
        status: String(httpStatus),
        responseMsg,
    };
    logger.error(PROCESS_FAILURE.message(funcName), logBody);
};

export const logResponse = (
    userId: LoggedUserIdType,
    req: Request,
    httpStatus: number,
    responseMsg: string,
    funcName: string,
) => {
    const logger = new CustomLogger();
    const logBody: LoggingObjType = {
        userId,
        ipAddress: req.ip,
        method: req.method,
        path: req.originalUrl,
        body: maskConfInfoInReqBody(req).body,
        status: String(httpStatus),
        responseMsg,
    };
    logger.log(PROCESS_SUCCESS.message(funcName), logBody);
};
