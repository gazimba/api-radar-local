import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/database/prisma";

export class BuscaController {
    async buscar(request: Request, response: Response) {
        const { q, cidadeSlug, page, limit } = z.object({
            q: z.string().min(2).max(100),
            cidadeSlug: z.string().optional(),
            page: z.coerce.number().int().min(1).default(1),
            limit: z.coerce.number().int().min(1).max(50).default(10),
        }).parse(request.query);

        const cidadeFiltro = cidadeSlug
            ? { cidade: { slug: String(cidadeSlug) } }
            : {};

        const where = {
            status: "APROVADO" as const,
            ativo: true,
            ...cidadeFiltro,
        };

        const pontoWhere = {
            ...where,
            OR: [
                { nome: { contains: q, mode: "insensitive" as const } },
                { descricao: { contains: q, mode: "insensitive" as const } },
            ],
        };

        const eventoWhere = {
            ...where,
            OR: [
                { nome: { contains: q, mode: "insensitive" as const } },
                { descricao: { contains: q, mode: "insensitive" as const } },
            ],
        };

        const [pontos, totalPontos, eventos, totalEventos] = await Promise.all([
            prisma.pontoTuristico.findMany({
                where: pontoWhere,
                select: {
                    id: true,
                    nome: true,
                    descricao: true,
                    imagens: { where: { capa: true }, select: { url: true }, take: 1 },
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.pontoTuristico.count({ where: pontoWhere }),
            prisma.evento.findMany({
                where: eventoWhere,
                select: {
                    id: true,
                    nome: true,
                    descricao: true,
                    data: true,
                    imagens: { where: { capa: true }, select: { url: true }, take: 1 },
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.evento.count({ where: eventoWhere }),
        ]);

        return response.json({
            pontos: pontos.map(p => ({ ...p, tipo: "ponto-turistico" as const })),
            totalPontos,
            eventos: eventos.map(e => ({ ...e, tipo: "evento" as const })),
            totalEventos,
            page,
            limit,
        });
    }
}
