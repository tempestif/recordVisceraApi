import { Logger, createLogger, transports, format } from "winston";
import { LoggingObjType } from "@/services/logger/loggerService";

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
                new transports.File({
                    filename: "log/combined.log",
                    level: "info",
                }),
                new transports.File({
                    filename: "log/debug.log",
                    level: "debug",
                }),
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
