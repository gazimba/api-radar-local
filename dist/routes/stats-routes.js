"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsRoutes = void 0;
const express_1 = require("express");
const prisma_1 = require("../database/prisma");
const ensure_authenticated_1 = require("../middlewares/ensure-authenticated");
const authorize_1 = require("../middlewares/authorize");
const statsRoutes = (0, express_1.Router)();
exports.statsRoutes = statsRoutes;
statsRoutes.get("/", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("MODERADOR", "ADMINISTRADOR"), async (req, res) => {
    const usuarioAtual = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: { cargo: true },
    });
    const isAdmin = usuarioAtual?.cargo === "ADMINISTRADOR";
    const agora = new Date();
    const [pontosAprovados, eventosFuturos, sugestoesPontos, sugestoesEventos, totalComentarios, comentariosReportados, recentLogs,] = await Promise.all([
        prisma_1.prisma.pontoTuristico.count({ where: { ativo: true, status: "APROVADO" } }),
        prisma_1.prisma.evento.count({ where: { ativo: true, status: "APROVADO", data: { gte: agora } } }),
        prisma_1.prisma.pontoTuristico.findMany({
            where: { status: "PENDENTE" },
            select: { id: true, nome: true, categoria: true, createdAt: true, sugestor: { select: { nome: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
        prisma_1.prisma.evento.findMany({
            where: { status: "PENDENTE" },
            select: { id: true, nome: true, createdAt: true, sugestor: { select: { nome: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
        prisma_1.prisma.comentario.count(),
        prisma_1.prisma.comentario.findMany({
            where: { reports: { some: {} } },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
                id: true,
                texto: true,
                createdAt: true,
                user: { select: { nome: true } },
                _count: { select: { reports: true } },
            },
        }),
        prisma_1.prisma.logAcao.findMany({
            orderBy: { createdAt: "desc" },
            take: 8,
            select: { id: true, acao: true, detalhes: true, createdAt: true, user: { select: { nome: true } } },
        }),
    ]);
    let totalUsuarios = 0;
    if (isAdmin) {
        totalUsuarios = await prisma_1.prisma.user.count();
    }
    return res.json({
        pontosAprovados,
        eventosFuturos,
        sugestoesPendentes: sugestoesPontos.length + sugestoesEventos.length,
        totalComentarios,
        reportsPendentes: comentariosReportados.length,
        totalUsuarios,
        sugestoesList: [
            ...sugestoesPontos.map(p => ({ id: p.id, nome: p.nome, tipo: "ponto", sugestor: p.sugestor?.nome ?? null, createdAt: p.createdAt })),
            ...sugestoesEventos.map(e => ({ id: e.id, nome: e.nome, tipo: "evento", sugestor: e.sugestor?.nome ?? null, createdAt: e.createdAt })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
        comentariosReportados: comentariosReportados.map(c => ({
            id: c.id,
            texto: c.texto,
            autor: c.user.nome,
            totalReports: c._count.reports,
            createdAt: c.createdAt,
        })),
        recentLogs,
    });
});
//# sourceMappingURL=stats-routes.js.map