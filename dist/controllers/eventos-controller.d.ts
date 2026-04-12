import type { Request, Response } from "express";
declare class EventosController {
    create(request: Request, response: Response): Promise<void>;
    listAll(_request: Request, response: Response): Promise<void>;
    listAllPendente(_request: Request, response: Response): Promise<void>;
    getById(request: Request, response: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(request: Request, response: Response): Promise<Response<any, Record<string, any>> | undefined>;
    aprovar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}
export { EventosController };
//# sourceMappingURL=eventos-controller.d.ts.map