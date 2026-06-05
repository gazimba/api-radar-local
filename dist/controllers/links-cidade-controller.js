"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinksCidadeController = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../database/prisma");
const linkSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(1).max(100),
    url: zod_1.z.string().url("URL inválida"),
});
class LinksCidadeController {
    async listar(request, response) {
        const { cidadeSlug } = zod_1.z.object({
            cidadeSlug: zod_1.z.string(),
        }).parse(request.params);
        const cidade = await prisma_1.prisma.cidade.findUnique({ where: { slug: cidadeSlug } });
        if (!cidade)
            return response.status(404).json({ message: "Cidade não encontrada." });
        const links = await prisma_1.prisma.linkCidade.findMany({
            where: { cidadeId: cidade.id },
            orderBy: { ordem: "asc" },
        });
        return response.json(links);
    }
    async criar(request, response) {
        const { cidadeSlug } = zod_1.z.object({ cidadeSlug: zod_1.z.string() }).parse(request.params);
        const { titulo, url } = linkSchema.parse(request.body);
        const cidade = await prisma_1.prisma.cidade.findUnique({ where: { slug: cidadeSlug } });
        if (!cidade)
            return response.status(404).json({ message: "Cidade não encontrada." });
        const ultimo = await prisma_1.prisma.linkCidade.findFirst({
            where: { cidadeId: cidade.id },
            orderBy: { ordem: "desc" },
        });
        const link = await prisma_1.prisma.linkCidade.create({
            data: { titulo, url, cidadeId: cidade.id, ordem: (ultimo?.ordem ?? -1) + 1 },
        });
        return response.status(201).json(link);
    }
    async atualizar(request, response) {
        const { id } = zod_1.z.object({ id: zod_1.z.coerce.number().int() }).parse(request.params);
        const { titulo, url } = linkSchema.parse(request.body);
        const link = await prisma_1.prisma.linkCidade.findUnique({ where: { id } });
        if (!link)
            return response.status(404).json({ message: "Link não encontrado." });
        const atualizado = await prisma_1.prisma.linkCidade.update({
            where: { id },
            data: { titulo, url },
        });
        return response.json(atualizado);
    }
    async deletar(request, response) {
        const { id } = zod_1.z.object({ id: zod_1.z.coerce.number().int() }).parse(request.params);
        const link = await prisma_1.prisma.linkCidade.findUnique({ where: { id } });
        if (!link)
            return response.status(404).json({ message: "Link não encontrado." });
        await prisma_1.prisma.linkCidade.delete({ where: { id } });
        // Reordenar os restantes
        const restantes = await prisma_1.prisma.linkCidade.findMany({
            where: { cidadeId: link.cidadeId },
            orderBy: { ordem: "asc" },
        });
        await Promise.all(restantes.map((l, i) => prisma_1.prisma.linkCidade.update({ where: { id: l.id }, data: { ordem: i } })));
        return response.status(204).send();
    }
    async reordenar(request, response) {
        const { cidadeSlug } = zod_1.z.object({ cidadeSlug: zod_1.z.string() }).parse(request.params);
        const { ids } = zod_1.z.object({ ids: zod_1.z.array(zod_1.z.number().int()) }).parse(request.body);
        const cidade = await prisma_1.prisma.cidade.findUnique({ where: { slug: cidadeSlug } });
        if (!cidade)
            return response.status(404).json({ message: "Cidade não encontrada." });
        await Promise.all(ids.map((id, i) => prisma_1.prisma.linkCidade.updateMany({
            where: { id, cidadeId: cidade.id },
            data: { ordem: i },
        })));
        return response.json({ message: "Ordem atualizada." });
    }
}
exports.LinksCidadeController = LinksCidadeController;
//# sourceMappingURL=links-cidade-controller.js.map