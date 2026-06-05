import type { Request, Response } from "express";
export declare class LinksController {
    listar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    criar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    atualizar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    deletar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=links-controller.d.ts.map