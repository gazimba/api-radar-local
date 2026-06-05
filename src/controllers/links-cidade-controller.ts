import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/database/prisma";

const linkSchema = z.object({
    titulo: z.string().min(1).max(100),
    url: z.string().url("URL inválida"),
});

export class LinksCidadeController {
    async listar(request: Request, response: Response) {
        const { cidadeSlug } = z.object({
            cidadeSlug: z.string(),
        }).parse(request.params);

        const cidade = await prisma.cidade.findUnique({ where: { slug: cidadeSlug } });
        if (!cidade) return response.status(404).json({ message: "Cidade não encontrada." });

        const links = await prisma.linkCidade.findMany({
            where: { cidadeId: cidade.id },
            orderBy: { ordem: "asc" },
        });

        return response.json(links);
    }

    async criar(request: Request, response: Response) {
        const { cidadeSlug } = z.object({ cidadeSlug: z.string() }).parse(request.params);
        const { titulo, url } = linkSchema.parse(request.body);

        const cidade = await prisma.cidade.findUnique({ where: { slug: cidadeSlug } });
        if (!cidade) return response.status(404).json({ message: "Cidade não encontrada." });

        const ultimo = await prisma.linkCidade.findFirst({
            where: { cidadeId: cidade.id },
            orderBy: { ordem: "desc" },
        });

        const link = await prisma.linkCidade.create({
            data: { titulo, url, cidadeId: cidade.id, ordem: (ultimo?.ordem ?? -1) + 1 },
        });

        return response.status(201).json(link);
    }

    async atualizar(request: Request, response: Response) {
        const { id } = z.object({ id: z.coerce.number().int() }).parse(request.params);
        const { titulo, url } = linkSchema.parse(request.body);

        const link = await prisma.linkCidade.findUnique({ where: { id } });
        if (!link) return response.status(404).json({ message: "Link não encontrado." });

        const atualizado = await prisma.linkCidade.update({
            where: { id },
            data: { titulo, url },
        });

        return response.json(atualizado);
    }

    async deletar(request: Request, response: Response) {
        const { id } = z.object({ id: z.coerce.number().int() }).parse(request.params);

        const link = await prisma.linkCidade.findUnique({ where: { id } });
        if (!link) return response.status(404).json({ message: "Link não encontrado." });

        await prisma.linkCidade.delete({ where: { id } });

        // Reordenar os restantes
        const restantes = await prisma.linkCidade.findMany({
            where: { cidadeId: link.cidadeId },
            orderBy: { ordem: "asc" },
        });
        await Promise.all(
            restantes.map((l, i) => prisma.linkCidade.update({ where: { id: l.id }, data: { ordem: i } }))
        );

        return response.status(204).send();
    }

    async reordenar(request: Request, response: Response) {
        const { cidadeSlug } = z.object({ cidadeSlug: z.string() }).parse(request.params);
        const { ids } = z.object({ ids: z.array(z.number().int()) }).parse(request.body);

        const cidade = await prisma.cidade.findUnique({ where: { slug: cidadeSlug } });
        if (!cidade) return response.status(404).json({ message: "Cidade não encontrada." });

        await Promise.all(
            ids.map((id, i) =>
                prisma.linkCidade.updateMany({
                    where: { id, cidadeId: cidade.id },
                    data: { ordem: i },
                })
            )
        );

        return response.json({ message: "Ordem atualizada." });
    }
}
