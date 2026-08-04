import { createLogger, transports, format } from 'winston';
import chalk from 'chalk';
import {env} from '../config/index.js';

const { combine, timestamp, json } = format;

const levelColors = {
	error: chalk.red.bold,
	warn: chalk.yellow,
	info: chalk.blue,
	http: chalk.magenta,
	verbose: chalk.cyan,
	debug: chalk.green,
	silly: chalk.gray
};

const consoleLogFormat = format.combine(
	format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	format.printf(({ level, message, timestamp }) => {
		// FIX: Cast 'level' to the exact keys of levelColors
		const colorizeLevel =
			levelColors[level as keyof typeof levelColors] || chalk.white; // Default to white if level is not found

		const styledLevel = colorizeLevel(level.toUpperCase());
		const styledTimestamp = chalk.gray(`[${timestamp}]`);

		return `${styledTimestamp} ${styledLevel}: ${message}`;
	})
);

const logger = createLogger({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',// Set log level based on environment
    format: combine(timestamp(), json()), // Use JSON format for logs
    transports: [
		new transports.Console({
			format: consoleLogFormat
		}),// Log to console
        new transports.File({ filename: 'logs/errors/error.log', level: 'error' }),// Log errors to a file
        new transports.File({ filename: 'logs/all/combined.log' })// Log all levels to a combined log file
    ]
})

export default logger;