import type { Request, Response } from "express";
declare class CidadesController {
    listAtivas(_request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    listAll(_request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    create(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    toggleAtiva(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    delete(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}
export { CidadesController };
//# sourceMappingURL=cidades-controller.d.ts.map