import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { logAcao } from "@/utils/log-acao";
import { enviarEmailSugestaoAprovada } from "@/utils/mailer";

class EventosController {
    async create(request: Request, response: Response) {
        const createEventoSchema = z.object({
            nome: z.string().min(2),
            descricao: z.string(),
            data: z.string(),
            horario: z.string(),
            local: z.string().optional(),
            link: z.string().optional(),
            gratuito: z.boolean().optional().default(false),
            informacoes: z.string(),
            latitude: z.number().optional().default(0),
            longitude: z.number().optional().default(0),
            status: z.enum(["PENDENTE", "APROVADO", "REJEITADO"]).default("APROVADO"),
            cidadeSlug: z.string().optional(),
        });

        const { nome, descricao, data, horario, local, link, gratuito, informacoes, latitude, longitude, status, cidadeSlug } =
            createEventoSchema.parse(request.body);

        const cidade = await prisma.cidade.findFirst({
            where: cidadeSlug ? { slug: cidadeSlug } : { slug: "congonhas-mg" },
        });

        if (!cidade) {
            return response.status(400).json({ message: "Cidade não encontrada." });
        }

        const evento = await prisma.evento.create({
            data: { nome, descricao, data: new Date(data), horario, local: local ?? null, link: link ?? null, gratuito, informacoes, latitude, longitude, status, cidadeId: cidade.id }
        });

        response.status(201).json({ message: "Evento criado com sucesso.", id: evento.id });
    }

    async listAll(request: Request, response: Response) {
        const { cidadeSlug, page, limit } = request.query;

        const pagina = Math.max(1, Number(page) || 1);
        const porPagina = limit ? Math.min(100, Math.max(1, Number(limit))) : 0;
        const paginado = porPagina > 0;

        const where = {
            status: "APROVADO" as const,
            ativo: true,
            ...(cidadeSlug ? { cidade: { slug: String(cidadeSlug) } } : {}),
        };

        const imagemCapaInclude = { imagens: { where: { capa: true }, select: { url: true }, take: 1 } };

        if (!paginado) {
            const eventos = await prisma.evento.findMany({
                orderBy: { data: "asc" },
                where,
                include: { cidade: { select: { nome: true, estado: true, slug: true } }, ...imagemCapaInclude },
            });
            return response.json(eventos);
        }

        const [total, eventos] = await Promise.all([
            prisma.evento.count({ where }),
            prisma.evento.findMany({
                orderBy: { data: "asc" },
                where,
                include: { cidade: { select: { nome: true, estado: true, slug: true } }, ...imagemCapaInclude },
                skip: (pagina - 1) * porPagina,
                take: porPagina,
            }),
        ]);

        return response.json({ data: eventos, total, page: pagina, totalPages: Math.ceil(total / porPagina) });
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
            where: { id: Number(id) },
            include: {
                imagens: { orderBy: [{ capa: "desc" }, { createdAt: "asc" }] },
                cidade: { select: { nome: true, estado: true, slug: true } },
                links: { orderBy: { createdAt: "asc" } },
            },
        });

        if (!evento) {
            return response.status(404).json({ message: "Evento não encontrado." });
        }
        response.json(evento);
    }

    async delete(request: Request, response: Response) {
        const { id } = request.params;
        const userId = request.user!.id;

        const eventoExistente = await prisma.evento.findUnique({
            where: { id: Number(id) }
        });

        if (!eventoExistente) {
            return response.status(404).json({ message: "Evento não encontrado." });
        }

        await prisma.evento.delete({ where: { id: Number(id) } });
        await logAcao(userId, "DELETAR_EVENTO", `Evento ID ${id}: ${eventoExistente.nome}`);
        response.json({ message: "Evento deletado com sucesso." });
    }

    async aprovar(request: Request, response: Response) {
        const { id } = request.params;
        const userId = request.user!.id;

        const evento = await prisma.evento.update({
            where: { id: Number(id) },
            data: { status: "APROVADO" },
            include: { sugestor: { select: { email: true, nome: true } } },
        });
        await logAcao(userId, "APROVAR_EVENTO", `Evento ID ${id}`);

        if (evento.sugestor) {
            enviarEmailSugestaoAprovada(evento.sugestor.email, evento.sugestor.nome, evento.nome).catch(() => {});
        }

        return response.json({ message: "Evento aprovado!" });
    }

    async listAllAdmin(_request: Request, response: Response) {
        const eventos = await prisma.evento.findMany({
            orderBy: { createdAt: "desc" },
            include: { cidade: { select: { nome: true, estado: true, slug: true } } },
        });
        return response.json(eventos);
    }

    async reativar(request: Request, response: Response) {
        const { id } = request.params;
        const userId = request.user!.id;
        const evento = await prisma.evento.findUnique({ where: { id: Number(id) } });
        if (!evento) return response.status(404).json({ message: "Evento não encontrado." });
        await prisma.evento.update({ where: { id: Number(id) }, data: { ativo: true } });
        await logAcao(userId, "REATIVAR_EVENTO", `Evento ID ${id}: ${evento.nome}`);
        return response.json({ message: "Evento reativado." });
    }

    async desativar(request: Request, response: Response) {
        const { id } = request.params;
        const userId = request.user!.id;
        const evento = await prisma.evento.findUnique({ where: { id: Number(id) } });
        if (!evento) return response.status(404).json({ message: "Evento não encontrado." });
        await prisma.evento.update({ where: { id: Number(id) }, data: { ativo: false } });
        await logAcao(userId, "DESATIVAR_EVENTO", `Evento ID ${id}: ${evento.nome}`);
        return response.json({ message: "Evento desativado." });
    }

    async update(request: Request, response: Response) {
        const { id } = request.params;

        const updateEventoSchema = z.object({
            nome: z.string().min(2),
            descricao: z.string(),
            data: z.string(),
            horario: z.string(),
            local: z.string().optional(),
            link: z.string().optional(),
            gratuito: z.boolean().optional().default(false),
            informacoes: z.string(),
            latitude: z.number().optional().default(0),
            longitude: z.number().optional().default(0),
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
                    local: data.local ?? null,
                    link: data.link ?? null,
                    gratuito: data.gratuito,
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
