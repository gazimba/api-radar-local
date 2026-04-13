import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/database/prisma";

class PontosTuristicosController {
    async create(request: Request, response: Response) {
        const createPontoSchema = z.object({
            nome: z.string().min(2),
            descricao: z.string(),
            destaques: z.string(),
            informacoes: z.string(),
            latitude: z.number(),
            longitude: z.number(),
            status: z.enum(["PENDENTE", "APROVADO", "REJEITADO"]).default("APROVADO")
        });

        const { nome, descricao, destaques, informacoes, latitude, longitude, status } =
            createPontoSchema.parse(request.body);

        await prisma.pontoTuristico.create({
            data: {
                nome,
                descricao,
                destaques,
                informacoes,
                latitude,
                longitude,
                status
            }
        });

        response.status(201).json({ message: "Ponto turístico criado." });
    }

    async listAll(_request: Request, response: Response) {
        const pontos = await prisma.pontoTuristico.findMany({
            orderBy: {
                createdAt: "asc"
            },
            where: {
                status: "APROVADO"
            }
        });
        response.json(pontos);
    }
    async listAllPendente(_request: Request, response: Response) {
        const pontos = await prisma.pontoTuristico.findMany({
            orderBy: {
                createdAt: "asc"
            },
            where: {
                status: "PENDENTE"
            }
        });
        response.json(pontos);
    }

    async getById(request: Request, response: Response) {
        const { id } = request.params;
        const ponto = await prisma.pontoTuristico.findUnique({
            where: { id: Number(id) }
        });

        if (!ponto) {
            return response.status(404).json({ message: "Ponto não encontrado." });
        }
        response.json(ponto);
    }

    async delete(request: Request, response: Response) {
        const { id } = request.params;
        await prisma.pontoTuristico.delete({
            where: { id: Number(id) }
        });
        response.json({ message: "Ponto deletado." });
    }

    async aprovar(request: Request, response: Response) {
        const { id } = request.params;
        await prisma.pontoTuristico.update({
            where: { id: Number(id) },
            data: { status: "APROVADO" }
        });
        return response.json({ message: "Ponto turístico aprovado!" });
    }

    async update(request: Request, response: Response) {
        const { id } = request.params;

        const updatePontoSchema = z.object({
            nome: z.string().min(2),
            descricao: z.string(),
            destaques: z.string(),
            informacoes: z.string(),
            latitude: z.number(),
            longitude: z.number(),
        });

        try {
            const data = updatePontoSchema.parse(request.body);

            const pontoExistente = await prisma.pontoTuristico.findUnique({
                where: { id: Number(id) }
            });

            if (!pontoExistente) {
                return response.status(404).json({ message: "Ponto não encontrado." });
            }

            await prisma.pontoTuristico.update({
                where: { id: Number(id) },
                data: {
                    nome: data.nome,
                    descricao: data.descricao,
                    destaques: data.destaques,
                    informacoes: data.informacoes,
                    latitude: data.latitude,
                    longitude: data.longitude,
                }
            });

            return response.json({ message: "Ponto turístico atualizado com sucesso." });
        } catch (error) {
            return response.status(400).json({ message: "Erro de validação. Verifique os dados enviados." });
        }
    }
}

export { PontosTuristicosController };