"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinksController = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../database/prisma");
const tipoSchema = zod_1.z.enum(["ponto-turistico", "evento"]);
const linkSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(1).max(100),
    url: zod_1.z.string().url("URL inválida"),
});
class LinksController {
    async listar(request, response) {
        const { tipo, id } = zod_1.z.object({
            tipo: tipoSchema,
            id: zod_1.z.coerce.number().int(),
        }).parse(request.params);
        const where = tipo === "ponto-turistico"
            ? { pontoTuristicoId: id }
            : { eventoId: id };
        const links = await prisma_1.prisma.linkUtil.findMany({
            where,
            orderBy: { createdAt: "asc" },
        });
        return response.json(links);
    }
    async criar(request, response) {
        const { tipo, id } = zod_1.z.object({
            tipo: tipoSchema,
            id: zod_1.z.coerce.number().int(),
        }).parse(request.params);
        const { titulo, url } = linkSchema.parse(request.body);
        const data = tipo === "ponto-turistico"
            ? { titulo, url, pontoTuristicoId: id }
            : { titulo, url, eventoId: id };
        const link = await prisma_1.prisma.linkUtil.create({ data });
        return response.status(201).json(link);
    }
    async atualizar(request, response) {
        const { id } = zod_1.z.object({ id: zod_1.z.coerce.number().int() }).parse(request.params);
        const { titulo, url } = linkSchema.parse(request.body);
        const link = await prisma_1.prisma.linkUtil.findUnique({ where: { id } });
        if (!link)
            return response.status(404).json({ message: "Link não encontrado." });
        const atualizado = await prisma_1.prisma.linkUtil.update({
            where: { id },
            data: { titulo, url },
        });
        return response.json(atualizado);
    }
    async deletar(request, response) {
        const { id } = zod_1.z.object({ id: zod_1.z.coerce.number().int() }).parse(request.params);
        const link = await prisma_1.prisma.linkUtil.findUnique({ where: { id } });
        if (!link)
            return response.status(404).json({ message: "Link não encontrado." });
        await prisma_1.prisma.linkUtil.delete({ where: { id } });
        return response.status(204).send();
    }
}
exports.LinksController = LinksController;
//# sourceMappingURL=links-controller.js.map