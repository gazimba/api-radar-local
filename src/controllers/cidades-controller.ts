import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/database/prisma";

class CidadesController {
    async listAtivas(_request: Request, response: Response) {
        const cidades = await prisma.cidade.findMany({
            where: { ativa: true },
            orderBy: { nome: "asc" },
            select: { id: true, nome: true, estado: true, slug: true },
        });
        return response.json(cidades);
    }

    async listAll(_request: Request, response: Response) {
        const cidades = await prisma.cidade.findMany({
            orderBy: { nome: "asc" },
        });
        return response.json(cidades);
    }

    async create(request: Request, response: Response) {
        const createCidadeSchema = z.object({
            nome: z.string().min(2, { message: "Nome obrigatório" }),
            estado: z.string().length(2, { message: "Use a sigla do estado (ex: MG)" }),
        });

        const { nome, estado } = createCidadeSchema.parse(request.body);

        const slug = `${nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-")}-${estado.toLowerCase()}`;

        const jaExiste = await prisma.cidade.findUnique({ where: { slug } });
        if (jaExiste) {
            return response.status(409).json({ message: "Essa cidade já está cadastrada." });
        }

        const cidade = await prisma.cidade.create({
            data: { nome, estado: estado.toUpperCase(), slug, ativa: false },
        });

        return response.status(201).json(cidade);
    }

    async toggleAtiva(request: Request, response: Response) {
        const { id } = request.params;

        const cidade = await prisma.cidade.findUnique({ where: { id: Number(id) } });

        if (!cidade) {
            return response.status(404).json({ message: "Cidade não encontrada." });
        }

        const atualizada = await prisma.cidade.update({
            where: { id: Number(id) },
            data: { ativa: !cidade.ativa },
        });

        return response.json({
            message: `Cidade ${atualizada.ativa ? "ativada" : "desativada"} com sucesso.`,
            cidade: atualizada,
        });
    }

    async delete(request: Request, response: Response) {
        const { id } = request.params;

        const cidade = await prisma.cidade.findUnique({ where: { id: Number(id) } });

        if (!cidade) {
            return response.status(404).json({ message: "Cidade não encontrada." });
        }

        await prisma.cidade.delete({ where: { id: Number(id) } });

        return response.json({ message: "Cidade removida com sucesso." });
    }
}

export { CidadesController };
