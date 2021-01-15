import winston from "winston";
import { Logger as LoggerInterface, format } from "winston";
import { FileTransportOptions } from "winston/lib/winston/transports";

export enum levels {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    HTTP = 3,
    VERBOSE = 4,
    DEBUG = 5,
    SILLY = 6
}

export class Logger {
    private static logger: LoggerInterface;

    public static createLogger(name: string, level: levels): LoggerInterface {
        const stringLevel = levels[level].toLowerCase();

        const transportAttributes: FileTransportOptions = {
            filename: process.env.LOG_FILE,
            level: stringLevel,
            format: winston.format.combine(
                winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                this.getScrapyLogFormat()
            ),
            handleExceptions: true, // TODO: NOT WORKING
        };

        const transport = !!process.env.LOG_FILE && process.env.LOG_FILE.length
            ? new winston.transports.File(transportAttributes)
            : new winston.transports.Console(transportAttributes);

        if (!this.logger) {
            this.logger = winston.createLogger({
                level: stringLevel,
                transports: [transport],
                handleExceptions: true, // TODO: NOT WORKING
            });
        }

        return this.logger.child({
            label: name
        });
    }

    private static getScrapyLogFormat() {
        return format.printf(({ level, message, label, timestamp }) => {
            return `${timestamp} [${label}] ${level.trim().toUpperCase()}: ${message}`;
        });
    }
}
