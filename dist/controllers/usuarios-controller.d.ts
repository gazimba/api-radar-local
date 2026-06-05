import type { Request, Response } from "express";
declare class UsuariosController {
    register(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    create(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    listAll(_request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    getById(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    delete(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    alterarSenha(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    alterarCargo(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    alterarAtivo(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    uploadFoto(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    atualizarPerfil(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    silenciar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    dessilenciar(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}
export { UsuariosController };
//# sourceMappingURL=usuarios-controller.d.ts.map