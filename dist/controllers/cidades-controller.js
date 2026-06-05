"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CidadesController = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../database/prisma");
class CidadesController {
    async listAtivas(_request, response) {
        const cidades = await prisma_1.prisma.cidade.findMany({
            where: { ativa: true },
            orderBy: { nome: "asc" },
            select: { id: true, nome: true, estado: true, slug: true },
        });
        return response.json(cidades);
    }
    async listAll(_request, response) {
        const cidades = await prisma_1.prisma.cidade.findMany({
            orderBy: { nome: "asc" },
        });
        return response.json(cidades);
    }
    async create(request, response) {
        const createCidadeSchema = zod_1.z.object({
            nome: zod_1.z.string().min(2, { message: "Nome obrigatório" }),
            estado: zod_1.z.string().length(2, { message: "Use a sigla do estado (ex: MG)" }),
        });
        const { nome, estado } = createCidadeSchema.parse(request.body);
        const slug = `${nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-")}-${estado.toLowerCase()}`;
        const jaExiste = await prisma_1.prisma.cidade.findUnique({ where: { slug } });
        if (jaExiste) {
            return response.status(409).json({ message: "Essa cidade já está cadastrada." });
        }
        const cidade = await prisma_1.prisma.cidade.create({
            data: { nome, estado: estado.toUpperCase(), slug, ativa: false },
        });
        return response.status(201).json(cidade);
    }
    async toggleAtiva(request, response) {
        const { id } = request.params;
        const cidade = await prisma_1.prisma.cidade.findUnique({ where: { id: Number(id) } });
        if (!cidade) {
            return response.status(404).json({ message: "Cidade não encontrada." });
        }
        const atualizada = await prisma_1.prisma.cidade.update({
            where: { id: Number(id) },
            data: { ativa: !cidade.ativa },
        });
        return response.json({
            message: `Cidade ${atualizada.ativa ? "ativada" : "desativada"} com sucesso.`,
            cidade: atualizada,
        });
    }
    async delete(request, response) {
        const { id } = request.params;
        const cidade = await prisma_1.prisma.cidade.findUnique({ where: { id: Number(id) } });
        if (!cidade) {
            return response.status(404).json({ message: "Cidade não encontrada." });
        }
        await prisma_1.prisma.cidade.delete({ where: { id: Number(id) } });
        return response.json({ message: "Cidade removida com sucesso." });
    }
}
exports.CidadesController = CidadesController;
//# sourceMappingURL=cidades-controller.js.map