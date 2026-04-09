import { Request, Response } from "express";

class EventosController {
    async create(request: Request, response: Response) {
        console.log("Criando evento...");
    }
    async get(request: Request, response: Response) {
        console.log("Obtendo evento...");
    }

}

export { EventosController };