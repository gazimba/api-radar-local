"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuscaController = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../database/prisma");
class BuscaController {
    async buscar(request, response) {
        const { q, cidadeSlug, page, limit } = zod_1.z.object({
            q: zod_1.z.string().min(2).max(100),
            cidadeSlug: zod_1.z.string().optional(),
            page: zod_1.z.coerce.number().int().min(1).default(1),
            limit: zod_1.z.coerce.number().int().min(1).max(50).default(10),
        }).parse(request.query);
        const cidadeFiltro = cidadeSlug
            ? { cidade: { slug: String(cidadeSlug) } }
            : {};
        const where = {
            status: "APROVADO",
            ativo: true,
            ...cidadeFiltro,
        };
        const pontoWhere = {
            ...where,
            OR: [
                { nome: { contains: q, mode: "insensitive" } },
                { descricao: { contains: q, mode: "insensitive" } },
            ],
        };
        const eventoWhere = {
            ...where,
            OR: [
                { nome: { contains: q, mode: "insensitive" } },
                { descricao: { contains: q, mode: "insensitive" } },
            ],
        };
        const [pontos, totalPontos, eventos, totalEventos] = await Promise.all([
            prisma_1.prisma.pontoTuristico.findMany({
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
            prisma_1.prisma.pontoTuristico.count({ where: pontoWhere }),
            prisma_1.prisma.evento.findMany({
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
            prisma_1.prisma.evento.count({ where: eventoWhere }),
        ]);
        return response.json({
            pontos: pontos.map(p => ({ ...p, tipo: "ponto-turistico" })),
            totalPontos,
            eventos: eventos.map(e => ({ ...e, tipo: "evento" })),
            totalEventos,
            page,
            limit,
        });
    }
}
exports.BuscaController = BuscaController;
//# sourceMappingURL=busca-controller.js.map