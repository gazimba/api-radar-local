"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComentariosController = void 0;
const prisma_1 = require("../database/prisma");
const zod_1 = require("zod");
class ComentariosController {
    async create(request, response) {
        const paramsSchema = zod_1.z.object({
            tipo: zod_1.z.enum(["ponto-turistico", "evento"]),
            id: zod_1.z.coerce.number().int().positive(),
        });
        const bodySchema = zod_1.z.object({
            texto: zod_1.z.string().min(1).max(1000),
        });
        const { tipo, id } = paramsSchema.parse(request.params);
        const { texto } = bodySchema.parse(request.body);
        const userId = request.user.id;
        const autor = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { silenciadoAte: true },
        });
        if (autor?.silenciadoAte && autor.silenciadoAte > new Date()) {
            const ate = autor.silenciadoAte.getFullYear() >= 2099
                ? "permanentemente"
                : `até ${autor.silenciadoAte.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`;
            return response.status(403).json({ message: `Você está silenciado e não pode comentar ${ate}.` });
        }
        const data = tipo === "ponto-turistico"
            ? { texto, userId, pontoTuristicoId: id }
            : { texto, userId, eventoId: id };
        const comentario = await prisma_1.prisma.comentario.create({
            data,
            include: { user: { select: { id: true, nome: true, foto: true } } },
        });
        return response.status(201).json(comentario);
    }
    async listByLocal(request, response) {
        const paramsSchema = zod_1.z.object({
            tipo: zod_1.z.enum(["ponto-turistico", "evento"]),
            id: zod_1.z.coerce.number().int().positive(),
        });
        const { tipo, id } = paramsSchema.parse(request.params);
        const where = tipo === "ponto-turistico"
            ? { pontoTuristicoId: id }
            : { eventoId: id };
        const comentarios = await prisma_1.prisma.comentario.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { id: true, nome: true, foto: true } } },
        });
        return response.json(comentarios);
    }
    async listAll(request, response) {
        const { q, tipo, page, reportados } = request.query;
        const pagina = Math.max(1, Number(page) || 1);
        const POR_PAGINA = 20;
        const where = {};
        if (tipo === "ponto-turistico")
            where.pontoTuristicoId = { not: null };
        if (tipo === "evento")
            where.eventoId = { not: null };
        if (reportados === "1")
            where.reports = { some: {} };
        if (q) {
            where.OR = [
                { texto: { contains: String(q), mode: "insensitive" } },
                { user: { nome: { contains: String(q), mode: "insensitive" } } },
            ];
        }
        const [total, comentarios] = await Promise.all([
            prisma_1.prisma.comentario.count({ where }),
            prisma_1.prisma.comentario.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (pagina - 1) * POR_PAGINA,
                take: POR_PAGINA,
                include: {
                    user: { select: { id: true, nome: true, foto: true, ativo: true, silenciadoAte: true } },
                    pontoTuristico: { select: { id: true, nome: true } },
                    evento: { select: { id: true, nome: true } },
                    reports: { select: { id: true, motivo: true, createdAt: true, user: { select: { nome: true } } } },
                },
            }),
        ]);
        return response.json({ comentarios, total, pagina, totalPaginas: Math.ceil(total / POR_PAGINA) });
    }
    async reportar(request, response) {
        const { id } = zod_1.z.object({ id: zod_1.z.coerce.number().int().positive() }).parse(request.params);
        const { motivo } = zod_1.z.object({ motivo: zod_1.z.string().max(300).optional() }).parse(request.body);
        const userId = request.user.id;
        const comentario = await prisma_1.prisma.comentario.findUnique({ where: { id } });
        if (!comentario)
            return response.status(404).json({ message: "Comentário não encontrado." });
        if (comentario.userId === userId)
            return response.status(400).json({ message: "Você não pode reportar seu próprio comentário." });
        await prisma_1.prisma.reportComentario.upsert({
            where: { comentarioId_userId: { comentarioId: id, userId } },
            create: { comentarioId: id, userId, motivo: motivo ?? null },
            update: { motivo: motivo ?? null },
        });
        return response.json({ message: "Comentário reportado. Nossa equipe irá analisar." });
    }
    async dispensarReport(request, response) {
        const { id } = zod_1.z.object({ id: zod_1.z.coerce.number().int().positive() }).parse(request.params);
        await prisma_1.prisma.reportComentario.deleteMany({ where: { comentarioId: id } });
        return response.json({ message: "Reports dispensados." });
    }
    async delete(request, response) {
        const { id } = zod_1.z.object({ id: zod_1.z.coerce.number().int().positive() }).parse(request.params);
        const userId = request.user.id;
        const comentario = await prisma_1.prisma.comentario.findUnique({ where: { id } });
        if (!comentario) {
            return response.status(404).json({ message: "Comentário não encontrado." });
        }
        const usuario = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { cargo: true },
        });
        const isAutor = comentario.userId === userId;
        const isAdmin = usuario?.cargo === "ADMINISTRADOR" || usuario?.cargo === "MODERADOR";
        if (!isAutor && !isAdmin) {
            return response.status(403).json({ message: "Sem permissão para deletar este comentário." });
        }
        await prisma_1.prisma.comentario.delete({ where: { id } });
        return response.json({ message: "Comentário removido." });
    }
}
exports.ComentariosController = ComentariosController;
//# sourceMappingURL=comentarios-controller.js.map