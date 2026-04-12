import type { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";

export class SugestoesController {
    async create(request: Request, response: Response) {
        const schema = z.object({
            categoria: z.enum(["evento", "ponto-turistico"]),
            nome: z.string().min(2),
            descricao: z.string(),
            informacoes: z.string(),
            latitude: z.number().optional(),
            longitude: z.number().optional(),
            // Campos específicos
            data: z.string().optional(),
            horario: z.string().optional(),
            destaques: z.string().optional(),
        });

        try {
            const data = schema.parse(request.body);

            if (data.categoria === "evento") {
                await prisma.evento.create({
                    data: {
                        nome: data.nome,
                        descricao: data.descricao,
                        informacoes: data.informacoes,
                        data: data.data ? new Date(data.data) : new Date(),
                        horario: data.horario || "A definir",
                        latitude: data.latitude || 0,
                        longitude: data.longitude || 0,
                        status: "PENDENTE"
                    }
                });
            } else {
                await prisma.pontoTuristico.create({
                    data: {
                        nome: data.nome,
                        descricao: data.descricao,
                        informacoes: data.informacoes,
                        destaques: data.destaques || "Nenhum destaque informado",
                        latitude: data.latitude || 0,
                        longitude: data.longitude || 0,
                        status: "PENDENTE"
                    }
                });
            }

            return response.status(201).json({ message: "Sugestão enviada com sucesso!" });
        } catch (error) {
            return response.status(400).json({ message: "Erro ao processar sugestão." });
        }
    }

    async listAll(_request: Request, response: Response) {
        const [eventos, pontos] = await Promise.all([
            prisma.evento.findMany({ where: { status: "PENDENTE" } }),
            prisma.pontoTuristico.findMany({ where: { status: "PENDENTE" } })
        ]);
        return response.json({ eventos, pontos });
    }
}