import winston, { format, transports } from "winston";
import { env } from "node:process";

const consoleFormatting = winston.format.printf(({ timestamp, level, message, ...meta }) => {
	// with meta logging:
	// return `[${level.toUpperCase()}/${timestamp}${meta.caller ? `/${meta.caller}` : ""}] ${message} (${meta ? JSON.stringify(meta) : ''})`;
	return `[${level.toUpperCase()}/${timestamp}${meta.caller ? `/${meta.caller}` : ""}] ${message}`;
});

let finalLevel;
switch (env.NODE_ENV) {
case "development":
	finalLevel = "debug";
	break;

default:
	finalLevel = "info";
	break;
}

const logger = winston.createLogger({
	level: finalLevel,
	format: format.combine(
		format.timestamp({
			format: "YYYY-MM-DD HH:mm:ss",
		}),
		format.errors({ stack: true }),
		format.splat(),
		format.json(),
	),
	transports: [
		new transports.File({
			level: "debug",
			filename: `logs/${Date.now()}.log`,
		}),
		new transports.Console(
			{
				format: format.combine(
					consoleFormatting,
					format.colorize({ all:true }),
				),
			},
		),
	],
});

logger.info("Initialized logger", { caller: "Logger" });

export default logger;