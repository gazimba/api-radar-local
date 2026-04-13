import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/database/prisma";

class EventosController {
    async create(request: Request, response: Response) {
        const createEventoSchema = z.object({
            nome: z.string().min(2),
            descricao: z.string(),
            data: z.string(),
            horario: z.string(),
            informacoes: z.string(),
            latitude: z.number(),
            longitude: z.number(),
            status: z.enum(["PENDENTE", "APROVADO", "REJEITADO"]).default("APROVADO")
        });

        const { nome, descricao, data, horario, informacoes, latitude, longitude, status } =
            createEventoSchema.parse(request.body);

        await prisma.evento.create({
            data: {
                nome,
                descricao,
                data: new Date(data),
                horario,
                informacoes,
                latitude,
                longitude,
                status
            }
        });

        response.status(201).json({ message: "Evento criado com sucesso." });
    }

    async listAll(_request: Request, response: Response) {
        const eventos = await prisma.evento.findMany({
            orderBy: {
                data: "asc"
            },
            where: {
                status: "APROVADO"
            }
        });
        response.json(eventos);
    }

    async listAllPendente(_request: Request, response: Response) {
        const eventos = await prisma.evento.findMany({
            orderBy: {
                createdAt: "asc"
            },
            where: {
                status: "PENDENTE"
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

    async aprovar(request: Request, response: Response) {
        const { id } = request.params;
        await prisma.evento.update({
            where: { id: Number(id) },
            data: { status: "APROVADO" }
        });
        return response.json({ message: "Evento aprovado!" });
    }

    async update(request: Request, response: Response) {
        const { id } = request.params;

        const updateEventoSchema = z.object({
            nome: z.string().min(2),
            descricao: z.string(),
            data: z.string(),
            horario: z.string(),
            informacoes: z.string(),
            latitude: z.number(),
            longitude: z.number(),
        });

        try {
            const data = updateEventoSchema.parse(request.body);

            const eventoExistente = await prisma.evento.findUnique({
                where: { id: Number(id) }
            });

            if (!eventoExistente) {
                return response.status(404).json({ message: "Evento não encontrado." });
            }

            await prisma.evento.update({
                where: { id: Number(id) },
                data: {
                    nome: data.nome,
                    descricao: data.descricao,
                    data: new Date(data.data),
                    horario: data.horario,
                    informacoes: data.informacoes,
                    latitude: data.latitude,
                    longitude: data.longitude,
                }
            });

            return response.json({ message: "Evento atualizado com sucesso." });
        } catch (error) {
            return response.status(400).json({ message: "Erro de validação. Verifique os dados enviados." });
        }
    }
}

export { EventosController };