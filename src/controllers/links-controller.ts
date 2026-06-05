import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/database/prisma";

const tipoSchema = z.enum(["ponto-turistico", "evento"]);

const linkSchema = z.object({
    titulo: z.string().min(1).max(100),
    url: z.string().url("URL inválida"),
});

export class LinksController {
    async listar(request: Request, response: Response) {
        const { tipo, id } = z.object({
            tipo: tipoSchema,
            id: z.coerce.number().int(),
        }).parse(request.params);

        const where = tipo === "ponto-turistico"
            ? { pontoTuristicoId: id }
            : { eventoId: id };

        const links = await prisma.linkUtil.findMany({
            where,
            orderBy: { createdAt: "asc" },
        });

        return response.json(links);
    }

    async criar(request: Request, response: Response) {
        const { tipo, id } = z.object({
            tipo: tipoSchema,
            id: z.coerce.number().int(),
        }).parse(request.params);

        const { titulo, url } = linkSchema.parse(request.body);

        const data = tipo === "ponto-turistico"
            ? { titulo, url, pontoTuristicoId: id }
            : { titulo, url, eventoId: id };

        const link = await prisma.linkUtil.create({ data });

        return response.status(201).json(link);
    }

    async atualizar(request: Request, response: Response) {
        const { id } = z.object({ id: z.coerce.number().int() }).parse(request.params);
        const { titulo, url } = linkSchema.parse(request.body);

        const link = await prisma.linkUtil.findUnique({ where: { id } });
        if (!link) return response.status(404).json({ message: "Link não encontrado." });

        const atualizado = await prisma.linkUtil.update({
            where: { id },
            data: { titulo, url },
        });

        return response.json(atualizado);
    }

    async deletar(request: Request, response: Response) {
        const { id } = z.object({ id: z.coerce.number().int() }).parse(request.params);

        const link = await prisma.linkUtil.findUnique({ where: { id } });
        if (!link) return response.status(404).json({ message: "Link não encontrado." });

        await prisma.linkUtil.delete({ where: { id } });

        return response.status(204).send();
    }
}
