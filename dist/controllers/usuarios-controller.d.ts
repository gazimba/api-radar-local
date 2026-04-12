import type { Request, Response } from "express";
declare class UsuariosController {
    create(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    listAll(_request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    getById(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    delete(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}
export { UsuariosController };
//# sourceMappingURL=usuarios-controller.d.ts.map