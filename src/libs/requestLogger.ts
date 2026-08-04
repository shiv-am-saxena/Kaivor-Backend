import morgan from 'morgan';
import logger from './logger.js';

// Create a custom morgan format that uses the logger
const morganFormat = (tokens: any, req: any, res: any) => {
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const status = tokens.status(req, res);
    const contentLength = tokens.res(req, res, 'content-length');
    const responseTime = tokens['response-time'](req, res);

    return `${method} ${url} ${status} ${contentLength} - ${responseTime} ms`;
};

// Create a morgan middleware that logs using the custom format
const requestLogger = morgan(morganFormat, {
    stream: {
        write: (message) => logger.info(message.trim()), // Log to winston logger
    },
});

export default requestLogger;