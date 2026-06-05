import type { Request, Response, NextFunction } from "express";
type Cargo = "COMUM" | "MODERADOR" | "ADMINISTRADOR";
export declare function authorize(...roles: Cargo[]): (request: Request, response: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=authorize.d.ts.map