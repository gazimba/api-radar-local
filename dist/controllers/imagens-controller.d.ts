import type { Request, Response } from "express";
declare class ImagensController {
    upload(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    listar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    definirCapa(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    deletar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}
export { ImagensController };
//# sourceMappingURL=imagens-controller.d.ts.map