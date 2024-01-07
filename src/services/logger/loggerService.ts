import { PROCESS_FAILURE, UNSPECIFIED_USER_ID_TYPE } from "@/consts/logConsts";
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

const CONF_INFO_NAMES = ["email", "password"];

/**
 * 個人情報をマスクしたreqを作成する
 * @param req
 * @returns
 */
export const maskConfInfoInReqBody = (req: Request) => {
    for (let i of Object.keys(req.body)) {
        for (let confName of CONF_INFO_NAMES) {
            if (i === confName) {
                req.body[i] = "****";
            }
        }
    }
    return req;
};

/**
 * エラーが発生した際のログを出力する
 * @param responseMsg
 * @param userId
 * @param req
 * @param HttpStatus
 * @param funcName
 */
export const logError = (
    responseMsg: string,
    userId: number | UNSPECIFIED_USER_ID_TYPE,
    req: Request,
    HttpStatus: number,
    funcName: string
) => {
    const logger = new CustomLogger();
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
};
