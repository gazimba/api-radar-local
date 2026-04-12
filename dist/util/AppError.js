export class AppError {
    message;
    statusCode;
    code;
    constructor(message, statusCode = 400, code) {
        this.message = message;
        this.statusCode = statusCode;
        this.code = code;
    }
}
//# sourceMappingURL=AppError.js.map