import type { Request, Response } from "express";
declare class PontosTuristicosController {
    create(request: Request, response: Response): Promise<void>;
    listAll(_request: Request, response: Response): Promise<void>;
    listAllPendente(_request: Request, response: Response): Promise<void>;
    getById(request: Request, response: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(request: Request, response: Response): Promise<void>;
    aprovar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}
export { PontosTuristicosController };
//# sourceMappingURL=pontos-turisticos-controller.d.ts.map