import { createLogger, format, Logger, transports } from 'winston';

export class CustomLogger {
    private logger: Logger
    constructor() {
        // loggerを作成
        this.logger = createLogger({
            level: 'info',
            format: format.combine(format.timestamp(), format.json()),
            defaultMeta: { service: 'user-service' },
            transports: [
                //
                // - Write all logs with level `error` and below to `error.log`
                // - Write all logs with level `info` and below to `combined.log`
                //
                new transports.File({ filename: 'error.log', level: 'error' }),
                new transports.File({ filename: 'combined.log' }),
            ],
        })
    }
    log(message: string, userId: number) {
        this.logger.info(message, { userId });
    }

    error(message: string, trace: string) {
        this.logger.error(message, trace)
    }

    warn(message: string) {
        this.logger.warn(message);
    }

    debug(message: string) {
        this.logger.debug(message);
    }

    verbose(message: string) {
        this.logger.verbose(message)
    }
}