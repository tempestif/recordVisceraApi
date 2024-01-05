import { PROCESS_FAILURE, UNSPECIFIED_USER_ID_TYPE } from "@/consts/logConsts";
import { Request } from "express";
import { createLogger, format, Logger, transports } from "winston";
export type LoggingObjType = {
    userId: number | UNSPECIFIED_USER_ID_TYPE;
    ipAddress: string;
    method: string;
    path: string;
    body: string;
    status: string;
    responseMsg: string;
};

/**
 * Loggerクラス
 * 保存場所
 * error: log/error.log
 * その他: log/combined.log
 */
export class CustomLogger {
    private logger: Logger;
    constructor() {
        // loggerを作成
        this.logger = createLogger({
            level: "info",
            format: format.combine(format.timestamp(), format.json()),
            defaultMeta: { service: "user-service" },
            transports: [
                //
                // - Write all logs with level `error` and below to `error.log`
                // - Write all logs with level `info` and below to `combined.log`
                //
                new transports.File({
                    filename: "log/error.log",
                    level: "error",
                }),
                new transports.File({ filename: "log/combined.log" }),
            ],
        });
    }
    log(message: string, any?: any) {
        this.logger.info(message, any);
    }

    error(message: string, obj: LoggingObjType) {
        this.logger.error(message, obj);
    }

    warn(message: string) {
        this.logger.warn(message);
    }

    debug(message: string) {
        this.logger.debug(message);
    }

    verbose(message: string) {
        this.logger.verbose(message);
    }
}

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
