import type { Request, Response } from "express";
declare class PasswordResetController {
    solicitar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    redefinir(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}
export { PasswordResetController };
//# sourceMappingURL=password-reset-controller.d.ts.map