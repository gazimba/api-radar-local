import { Request, Response } from "express";

class UsuariosController {
    async create(request: Request, response: Response) {
        console.log("Criando evento...");
    }
    async get(request: Request, response: Response) {
        console.log("Obtendo evento...");
    }

}

export { UsuariosController };