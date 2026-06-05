"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventosController = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../database/prisma");
const log_acao_1 = require("../utils/log-acao");
const mailer_1 = require("../utils/mailer");
class EventosController {
    async create(request, response) {
        const createEventoSchema = zod_1.z.object({
            nome: zod_1.z.string().min(2),
            descricao: zod_1.z.string(),
            data: zod_1.z.string(),
            horario: zod_1.z.string(),
            local: zod_1.z.string().optional(),
            link: zod_1.z.string().optional(),
            gratuito: zod_1.z.boolean().optional().default(false),
            informacoes: zod_1.z.string(),
            latitude: zod_1.z.number().optional().default(0),
            longitude: zod_1.z.number().optional().default(0),
            status: zod_1.z.enum(["PENDENTE", "APROVADO", "REJEITADO"]).default("APROVADO"),
            cidadeSlug: zod_1.z.string().optional(),
        });
        const { nome, descricao, data, horario, local, link, gratuito, informacoes, latitude, longitude, status, cidadeSlug } = createEventoSchema.parse(request.body);
        const cidade = await prisma_1.prisma.cidade.findFirst({
            where: cidadeSlug ? { slug: cidadeSlug } : { slug: "congonhas-mg" },
        });
        if (!cidade) {
            return response.status(400).json({ message: "Cidade não encontrada." });
        }
        const evento = await prisma_1.prisma.evento.create({
            data: { nome, descricao, data: new Date(data), horario, local: local ?? null, link: link ?? null, gratuito, informacoes, latitude, longitude, status, cidadeId: cidade.id }
        });
        response.status(201).json({ message: "Evento criado com sucesso.", id: evento.id });
    }
    async listAll(request, response) {
        const { cidadeSlug, page, limit } = request.query;
        const pagina = Math.max(1, Number(page) || 1);
        const porPagina = limit ? Math.min(100, Math.max(1, Number(limit))) : 0;
        const paginado = porPagina > 0;
        const where = {
            status: "APROVADO",
            ativo: true,
            ...(cidadeSlug ? { cidade: { slug: String(cidadeSlug) } } : {}),
        };
        const imagemCapaInclude = { imagens: { where: { capa: true }, select: { url: true }, take: 1 } };
        if (!paginado) {
            const eventos = await prisma_1.prisma.evento.findMany({
                orderBy: { data: "asc" },
                where,
                include: { cidade: { select: { nome: true, estado: true, slug: true } }, ...imagemCapaInclude },
            });
            return response.json(eventos);
        }
        const [total, eventos] = await Promise.all([
            prisma_1.prisma.evento.count({ where }),
            prisma_1.prisma.evento.findMany({
                orderBy: { data: "asc" },
                where,
                include: { cidade: { select: { nome: true, estado: true, slug: true } }, ...imagemCapaInclude },
                skip: (pagina - 1) * porPagina,
                take: porPagina,
            }),
        ]);
        return response.json({ data: eventos, total, page: pagina, totalPages: Math.ceil(total / porPagina) });
    }
    async listAllPendente(_request, response) {
        const eventos = await prisma_1.prisma.evento.findMany({
            orderBy: {
                createdAt: "asc"
            },
            where: {
                status: "PENDENTE"
            }
        });
        response.json(eventos);
    }
    async getById(request, response) {
        const { id } = request.params;
        const evento = await prisma_1.prisma.evento.findUnique({
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
    async delete(request, response) {
        const { id } = request.params;
        const userId = request.user.id;
        const eventoExistente = await prisma_1.prisma.evento.findUnique({
            where: { id: Number(id) }
        });
        if (!eventoExistente) {
            return response.status(404).json({ message: "Evento não encontrado." });
        }
        await prisma_1.prisma.evento.delete({ where: { id: Number(id) } });
        await (0, log_acao_1.logAcao)(userId, "DELETAR_EVENTO", `Evento ID ${id}: ${eventoExistente.nome}`);
        response.json({ message: "Evento deletado com sucesso." });
    }
    async aprovar(request, response) {
        const { id } = request.params;
        const userId = request.user.id;
        const evento = await prisma_1.prisma.evento.update({
            where: { id: Number(id) },
            data: { status: "APROVADO" },
            include: { sugestor: { select: { email: true, nome: true } } },
        });
        await (0, log_acao_1.logAcao)(userId, "APROVAR_EVENTO", `Evento ID ${id}`);
        if (evento.sugestor) {
            (0, mailer_1.enviarEmailSugestaoAprovada)(evento.sugestor.email, evento.sugestor.nome, evento.nome).catch(() => { });
        }
        return response.json({ message: "Evento aprovado!" });
    }
    async listAllAdmin(_request, response) {
        const eventos = await prisma_1.prisma.evento.findMany({
            orderBy: { createdAt: "desc" },
            include: { cidade: { select: { nome: true, estado: true, slug: true } } },
        });
        return response.json(eventos);
    }
    async reativar(request, response) {
        const { id } = request.params;
        const userId = request.user.id;
        const evento = await prisma_1.prisma.evento.findUnique({ where: { id: Number(id) } });
        if (!evento)
            return response.status(404).json({ message: "Evento não encontrado." });
        await prisma_1.prisma.evento.update({ where: { id: Number(id) }, data: { ativo: true } });
        await (0, log_acao_1.logAcao)(userId, "REATIVAR_EVENTO", `Evento ID ${id}: ${evento.nome}`);
        return response.json({ message: "Evento reativado." });
    }
    async desativar(request, response) {
        const { id } = request.params;
        const userId = request.user.id;
        const evento = await prisma_1.prisma.evento.findUnique({ where: { id: Number(id) } });
        if (!evento)
            return response.status(404).json({ message: "Evento não encontrado." });
        await prisma_1.prisma.evento.update({ where: { id: Number(id) }, data: { ativo: false } });
        await (0, log_acao_1.logAcao)(userId, "DESATIVAR_EVENTO", `Evento ID ${id}: ${evento.nome}`);
        return response.json({ message: "Evento desativado." });
    }
    async update(request, response) {
        const { id } = request.params;
        const updateEventoSchema = zod_1.z.object({
            nome: zod_1.z.string().min(2),
            descricao: zod_1.z.string(),
            data: zod_1.z.string(),
            horario: zod_1.z.string(),
            local: zod_1.z.string().optional(),
            link: zod_1.z.string().optional(),
            gratuito: zod_1.z.boolean().optional().default(false),
            informacoes: zod_1.z.string(),
            latitude: zod_1.z.number().optional().default(0),
            longitude: zod_1.z.number().optional().default(0),
        });
        try {
            const data = updateEventoSchema.parse(request.body);
            const eventoExistente = await prisma_1.prisma.evento.findUnique({
                where: { id: Number(id) }
            });
            if (!eventoExistente) {
                return response.status(404).json({ message: "Evento não encontrado." });
            }
            await prisma_1.prisma.evento.update({
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
        }
        catch (error) {
            return response.status(400).json({ message: "Erro de validação. Verifique os dados enviados." });
        }
    }
}
exports.EventosController = EventosController;
//# sourceMappingURL=eventos-controller.js.map