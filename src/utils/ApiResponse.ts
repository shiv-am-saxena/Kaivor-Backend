export default class ApiResponse {
    success: boolean;
    statusCode: number;
    data: any;
    message: string
    constructor( statusCode: number, data: any, message: string) {
        this.success = true;
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
    }
}
