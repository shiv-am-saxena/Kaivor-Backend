export default class ApiError extends Error {
    statusCode: number;
    errors: Array<any>;
    success: boolean;
    message: string;
    data: any;
    stack?: any
    constructor(statusCode: number, message: string, errors: Array<any> = [], stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.success = false;
        this.message = message;
        this.data = null;
        if(stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}