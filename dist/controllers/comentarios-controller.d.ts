import type { Request, Response } from "express";
declare class ComentariosController {
    create(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    listByLocal(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    listAll(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    reportar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    dispensarReport(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    delete(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}
export { ComentariosController };
//# sourceMappingURL=comentarios-controller.d.ts.map