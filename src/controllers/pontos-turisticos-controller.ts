import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { logAcao } from "@/utils/log-acao";
import { enviarEmailSugestaoAprovada } from "@/utils/mailer";

const categoriaEnum = z.enum(["PONTO_TURISTICO", "HOTEL_POUSADA", "BAR_RESTAURANTE"]);

class PontosTuristicosController {
    async create(request: Request, response: Response) {
        const createPontoSchema = z.object({
            nome: z.string().min(2),
            descricao: z.string(),
            destaques: z.string().optional().default(""),
            informacoes: z.string(),
            endereco: z.string().optional(),
            horarioFuncionamento: z.string().optional(),
            telefone: z.string().optional(),
            site: z.string().optional(),
            latitude: z.number(),
            longitude: z.number(),
            categoria: categoriaEnum.default("PONTO_TURISTICO"),
            status: z.enum(["PENDENTE", "APROVADO", "REJEITADO"]).default("APROVADO"),
            cidadeSlug: z.string().optional(),
        });

        const { nome, descricao, destaques, informacoes, endereco, horarioFuncionamento, telefone, site, latitude, longitude, categoria, status, cidadeSlug } =
            createPontoSchema.parse(request.body);

        const cidade = await prisma.cidade.findFirst({
            where: cidadeSlug ? { slug: cidadeSlug } : { slug: "congonhas-mg" },
        });

        if (!cidade) {
            return response.status(400).json({ message: "Cidade não encontrada." });
        }

        const ponto = await prisma.pontoTuristico.create({
            data: { nome, descricao, destaques, informacoes, endereco: endereco ?? null, horarioFuncionamento: horarioFuncionamento ?? null, telefone: telefone ?? null, site: site ?? null, latitude, longitude, categoria, status, cidadeId: cidade.id }
        });

        response.status(201).json({ message: "Cadastro criado.", id: ponto.id });
    }

    async listAll(request: Request, response: Response) {
        const { cidadeSlug, page, limit, categoria } = request.query;

        const pagina = Math.max(1, Number(page) || 1);
        const porPagina = limit ? Math.min(100, Math.max(1, Number(limit))) : 0;
        const paginado = porPagina > 0;

        const where = {
            status: "APROVADO" as const,
            ativo: true,
            ...(cidadeSlug ? { cidade: { slug: String(cidadeSlug) } } : {}),
            ...(categoria ? { categoria: String(categoria) as any } : {}),
        };

        const imagemCapaInclude = { imagens: { where: { capa: true }, select: { url: true }, take: 1 } };

        if (!paginado) {
            const pontos = await prisma.pontoTuristico.findMany({
                orderBy: { createdAt: "asc" },
                where,
                include: { cidade: { select: { nome: true, estado: true, slug: true } }, ...imagemCapaInclude },
            });
            return response.json(pontos);
        }

        const [total, pontos] = await Promise.all([
            prisma.pontoTuristico.count({ where }),
            prisma.pontoTuristico.findMany({
                orderBy: { createdAt: "asc" },
                where,
                include: { cidade: { select: { nome: true, estado: true, slug: true } }, ...imagemCapaInclude },
                skip: (pagina - 1) * porPagina,
                take: porPagina,
            }),
        ]);

        return response.json({ data: pontos, total, page: pagina, totalPages: Math.ceil(total / porPagina) });
    }

    async listAllPendente(_request: Request, response: Response) {
        const pontos = await prisma.pontoTuristico.findMany({
            orderBy: { createdAt: "asc" },
            where: { status: "PENDENTE" },
        });
        response.json(pontos);
    }

    async getById(request: Request, response: Response) {
        const { id } = request.params;
        const ponto = await prisma.pontoTuristico.findUnique({
            where: { id: Number(id) },
            include: {
                imagens: { orderBy: [{ capa: "desc" }, { createdAt: "asc" }] },
                cidade: { select: { nome: true, estado: true, slug: true } },
                links: { orderBy: { createdAt: "asc" } },
            },
        });

        if (!ponto) {
            return response.status(404).json({ message: "Não encontrado." });
        }
        response.json(ponto);
    }

    async delete(request: Request, response: Response) {
        const { id } = request.params;
        const userId = request.user!.id;

        const ponto = await prisma.pontoTuristico.findUnique({ where: { id: Number(id) } });
        if (!ponto) return response.status(404).json({ message: "Não encontrado." });

        await prisma.pontoTuristico.delete({ where: { id: Number(id) } });
        await logAcao(userId, "DELETAR_PONTO", `ID ${id}: ${ponto.nome} [${ponto.categoria}]`);
        response.json({ message: "Deletado." });
    }

    async aprovar(request: Request, response: Response) {
        const { id } = request.params;
        const userId = request.user!.id;

        const ponto = await prisma.pontoTuristico.update({
            where: { id: Number(id) },
            data: { status: "APROVADO" },
            include: { sugestor: { select: { email: true, nome: true } } },
        });
        await logAcao(userId, "APROVAR_PONTO", `ID ${id}: ${ponto.nome}`);

        if (ponto.sugestor) {
            enviarEmailSugestaoAprovada(ponto.sugestor.email, ponto.sugestor.nome, ponto.nome).catch(() => {});
        }

        return response.json({ message: "Aprovado!" });
    }

    async listAllAdmin(request: Request, response: Response) {
        const { categoria } = request.query;
        const pontos = await prisma.pontoTuristico.findMany({
            orderBy: { createdAt: "desc" },
            where: categoria ? { categoria: String(categoria) as any } : {},
            include: { cidade: { select: { nome: true, estado: true, slug: true } } },
        });
        return response.json(pontos);
    }

    async reativar(request: Request, response: Response) {
        const { id } = request.params;
        const userId = request.user!.id;
        const ponto = await prisma.pontoTuristico.findUnique({ where: { id: Number(id) } });
        if (!ponto) return response.status(404).json({ message: "Não encontrado." });
        await prisma.pontoTuristico.update({ where: { id: Number(id) }, data: { ativo: true } });
        await logAcao(userId, "REATIVAR_PONTO", `ID ${id}: ${ponto.nome}`);
        return response.json({ message: "Reativado." });
    }

    async desativar(request: Request, response: Response) {
        const { id } = request.params;
        const userId = request.user!.id;
        const ponto = await prisma.pontoTuristico.findUnique({ where: { id: Number(id) } });
        if (!ponto) return response.status(404).json({ message: "Não encontrado." });
        await prisma.pontoTuristico.update({ where: { id: Number(id) }, data: { ativo: false } });
        await logAcao(userId, "DESATIVAR_PONTO", `ID ${id}: ${ponto.nome}`);
        return response.json({ message: "Desativado." });
    }

    async update(request: Request, response: Response) {
        const { id } = request.params;

        const updatePontoSchema = z.object({
            nome: z.string().min(2),
            descricao: z.string(),
            destaques: z.string().optional().default(""),
            informacoes: z.string(),
            endereco: z.string().optional(),
            horarioFuncionamento: z.string().optional(),
            telefone: z.string().optional(),
            site: z.string().optional(),
            latitude: z.number(),
            longitude: z.number(),
            categoria: categoriaEnum.optional(),
        });

        try {
            const data = updatePontoSchema.parse(request.body);

            const existente = await prisma.pontoTuristico.findUnique({ where: { id: Number(id) } });
            if (!existente) return response.status(404).json({ message: "Não encontrado." });

            await prisma.pontoTuristico.update({
                where: { id: Number(id) },
                data: {
                    nome: data.nome,
                    descricao: data.descricao,
                    destaques: data.destaques ?? "",
                    informacoes: data.informacoes,
                    endereco: data.endereco ?? null,
                    horarioFuncionamento: data.horarioFuncionamento ?? null,
                    telefone: data.telefone ?? null,
                    site: data.site ?? null,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    ...(data.categoria ? { categoria: data.categoria } : {}),
                }
            });

            return response.json({ message: "Atualizado com sucesso." });
        } catch {
            return response.status(400).json({ message: "Erro de validação." });
        }
    }
}

export { PontosTuristicosController };
