import type { Request, Response } from "express";
declare class EventosController {
    create(request: Request, response: Response): Promise<Response<any, Record<string, any>> | undefined>;
    listAll(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    listAllPendente(_request: Request, response: Response): Promise<void>;
    getById(request: Request, response: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(request: Request, response: Response): Promise<Response<any, Record<string, any>> | undefined>;
    aprovar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    listAllAdmin(_request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    reativar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    desativar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    update(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}
export { EventosController };
//# sourceMappingURL=eventos-controller.d.ts.map