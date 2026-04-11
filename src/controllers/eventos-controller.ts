import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/database/prisma";

class EventosController {
    async create(request: Request, response: Response) {
        const createEventoSchema = z.object({
            nome: z.string().min(2),
            descricao: z.string().max(200),
            data: z.string(), 
            horario: z.string(),
            informacoes: z.string().max(200),
            latitude: z.number(),
            longitude: z.number(),
        });

        const { nome, descricao, data, horario, informacoes, latitude, longitude } =
            createEventoSchema.parse(request.body);

        await prisma.evento.create({
            data: {
                nome,
                descricao,
                data: new Date(data), 
                horario,
                informacoes,
                latitude,
                longitude
            }
        });

        response.status(201).json({ message: "Evento criado com sucesso." });
    }

    async listAll(request: Request, response: Response) {
        const eventos = await prisma.evento.findMany({
            orderBy: {
                data: "asc" 
            }
        });
        response.json(eventos);
    }

    async getById(request: Request, response: Response) {
        const { id } = request.params;
        const evento = await prisma.evento.findUnique({
            where: { id: Number(id) }
        });

        if (!evento) {
            return response.status(404).json({ message: "Evento não encontrado." });
        }
        response.json(evento);
    }

    async delete(request: Request, response: Response) {
        const { id } = request.params;

        const eventoExistente = await prisma.evento.findUnique({
            where: { id: Number(id) }
        });

        if (!eventoExistente) {
            return response.status(404).json({ message: "Evento não encontrado." });
        }

        await prisma.evento.delete({
            where: { id: Number(id) }
        });

        response.json({ message: "Evento deletado com sucesso." });
    }
}

export { EventosController };