"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PontosTuristicosController = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../database/prisma");
const log_acao_1 = require("../utils/log-acao");
const mailer_1 = require("../utils/mailer");
const categoriaEnum = zod_1.z.enum(["PONTO_TURISTICO", "HOTEL_POUSADA", "BAR_RESTAURANTE"]);
class PontosTuristicosController {
    async create(request, response) {
        const createPontoSchema = zod_1.z.object({
            nome: zod_1.z.string().min(2),
            descricao: zod_1.z.string(),
            destaques: zod_1.z.string().optional().default(""),
            informacoes: zod_1.z.string(),
            endereco: zod_1.z.string().optional(),
            horarioFuncionamento: zod_1.z.string().optional(),
            telefone: zod_1.z.string().optional(),
            site: zod_1.z.string().optional(),
            latitude: zod_1.z.number(),
            longitude: zod_1.z.number(),
            categoria: categoriaEnum.default("PONTO_TURISTICO"),
            status: zod_1.z.enum(["PENDENTE", "APROVADO", "REJEITADO"]).default("APROVADO"),
            cidadeSlug: zod_1.z.string().optional(),
        });
        const { nome, descricao, destaques, informacoes, endereco, horarioFuncionamento, telefone, site, latitude, longitude, categoria, status, cidadeSlug } = createPontoSchema.parse(request.body);
        const cidade = await prisma_1.prisma.cidade.findFirst({
            where: cidadeSlug ? { slug: cidadeSlug } : { slug: "congonhas-mg" },
        });
        if (!cidade) {
            return response.status(400).json({ message: "Cidade não encontrada." });
        }
        const ponto = await prisma_1.prisma.pontoTuristico.create({
            data: { nome, descricao, destaques, informacoes, endereco: endereco ?? null, horarioFuncionamento: horarioFuncionamento ?? null, telefone: telefone ?? null, site: site ?? null, latitude, longitude, categoria, status, cidadeId: cidade.id }
        });
        response.status(201).json({ message: "Cadastro criado.", id: ponto.id });
    }
    async listAll(request, response) {
        const { cidadeSlug, page, limit, categoria } = request.query;
        const pagina = Math.max(1, Number(page) || 1);
        const porPagina = limit ? Math.min(100, Math.max(1, Number(limit))) : 0;
        const paginado = porPagina > 0;
        const where = {
            status: "APROVADO",
            ativo: true,
            ...(cidadeSlug ? { cidade: { slug: String(cidadeSlug) } } : {}),
            ...(categoria ? { categoria: String(categoria) } : {}),
        };
        const imagemCapaInclude = { imagens: { where: { capa: true }, select: { url: true }, take: 1 } };
        if (!paginado) {
            const pontos = await prisma_1.prisma.pontoTuristico.findMany({
                orderBy: { createdAt: "asc" },
                where,
                include: { cidade: { select: { nome: true, estado: true, slug: true } }, ...imagemCapaInclude },
            });
            return response.json(pontos);
        }
        const [total, pontos] = await Promise.all([
            prisma_1.prisma.pontoTuristico.count({ where }),
            prisma_1.prisma.pontoTuristico.findMany({
                orderBy: { createdAt: "asc" },
                where,
                include: { cidade: { select: { nome: true, estado: true, slug: true } }, ...imagemCapaInclude },
                skip: (pagina - 1) * porPagina,
                take: porPagina,
            }),
        ]);
        return response.json({ data: pontos, total, page: pagina, totalPages: Math.ceil(total / porPagina) });
    }
    async listAllPendente(_request, response) {
        const pontos = await prisma_1.prisma.pontoTuristico.findMany({
            orderBy: { createdAt: "asc" },
            where: { status: "PENDENTE" },
        });
        response.json(pontos);
    }
    async getById(request, response) {
        const { id } = request.params;
        const ponto = await prisma_1.prisma.pontoTuristico.findUnique({
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
    async delete(request, response) {
        const { id } = request.params;
        const userId = request.user.id;
        const ponto = await prisma_1.prisma.pontoTuristico.findUnique({ where: { id: Number(id) } });
        if (!ponto)
            return response.status(404).json({ message: "Não encontrado." });
        await prisma_1.prisma.pontoTuristico.delete({ where: { id: Number(id) } });
        await (0, log_acao_1.logAcao)(userId, "DELETAR_PONTO", `ID ${id}: ${ponto.nome} [${ponto.categoria}]`);
        response.json({ message: "Deletado." });
    }
    async aprovar(request, response) {
        const { id } = request.params;
        const userId = request.user.id;
        const ponto = await prisma_1.prisma.pontoTuristico.update({
            where: { id: Number(id) },
            data: { status: "APROVADO" },
            include: { sugestor: { select: { email: true, nome: true } } },
        });
        await (0, log_acao_1.logAcao)(userId, "APROVAR_PONTO", `ID ${id}: ${ponto.nome}`);
        if (ponto.sugestor) {
            (0, mailer_1.enviarEmailSugestaoAprovada)(ponto.sugestor.email, ponto.sugestor.nome, ponto.nome).catch(() => { });
        }
        return response.json({ message: "Aprovado!" });
    }
    async listAllAdmin(request, response) {
        const { categoria } = request.query;
        const pontos = await prisma_1.prisma.pontoTuristico.findMany({
            orderBy: { createdAt: "desc" },
            where: categoria ? { categoria: String(categoria) } : {},
            include: { cidade: { select: { nome: true, estado: true, slug: true } } },
        });
        return response.json(pontos);
    }
    async reativar(request, response) {
        const { id } = request.params;
        const userId = request.user.id;
        const ponto = await prisma_1.prisma.pontoTuristico.findUnique({ where: { id: Number(id) } });
        if (!ponto)
            return response.status(404).json({ message: "Não encontrado." });
        await prisma_1.prisma.pontoTuristico.update({ where: { id: Number(id) }, data: { ativo: true } });
        await (0, log_acao_1.logAcao)(userId, "REATIVAR_PONTO", `ID ${id}: ${ponto.nome}`);
        return response.json({ message: "Reativado." });
    }
    async desativar(request, response) {
        const { id } = request.params;
        const userId = request.user.id;
        const ponto = await prisma_1.prisma.pontoTuristico.findUnique({ where: { id: Number(id) } });
        if (!ponto)
            return response.status(404).json({ message: "Não encontrado." });
        await prisma_1.prisma.pontoTuristico.update({ where: { id: Number(id) }, data: { ativo: false } });
        await (0, log_acao_1.logAcao)(userId, "DESATIVAR_PONTO", `ID ${id}: ${ponto.nome}`);
        return response.json({ message: "Desativado." });
    }
    async update(request, response) {
        const { id } = request.params;
        const updatePontoSchema = zod_1.z.object({
            nome: zod_1.z.string().min(2),
            descricao: zod_1.z.string(),
            destaques: zod_1.z.string().optional().default(""),
            informacoes: zod_1.z.string(),
            endereco: zod_1.z.string().optional(),
            horarioFuncionamento: zod_1.z.string().optional(),
            telefone: zod_1.z.string().optional(),
            site: zod_1.z.string().optional(),
            latitude: zod_1.z.number(),
            longitude: zod_1.z.number(),
            categoria: categoriaEnum.optional(),
        });
        try {
            const data = updatePontoSchema.parse(request.body);
            const existente = await prisma_1.prisma.pontoTuristico.findUnique({ where: { id: Number(id) } });
            if (!existente)
                return response.status(404).json({ message: "Não encontrado." });
            await prisma_1.prisma.pontoTuristico.update({
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
        }
        catch {
            return response.status(400).json({ message: "Erro de validação." });
        }
    }
}
exports.PontosTuristicosController = PontosTuristicosController;
//# sourceMappingURL=pontos-turisticos-controller.js.map