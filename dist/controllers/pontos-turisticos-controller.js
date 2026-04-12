import { z } from "zod";
import { prisma } from "../database/prisma";
class PontosTuristicosController {
    async create(request, response) {
        const createPontoSchema = z.object({
            nome: z.string().min(2),
            descricao: z.string().max(200),
            destaques: z.string().max(200),
            informacoes: z.string().max(200),
            latitude: z.number(),
            longitude: z.number(),
            status: z.enum(["PENDENTE", "APROVADO", "REJEITADO"]).default("PENDENTE")
        });
        const { nome, descricao, destaques, informacoes, latitude, longitude, status } = createPontoSchema.parse(request.body);
        await prisma.pontoTuristico.create({
            data: {
                nome,
                descricao,
                destaques,
                informacoes,
                latitude,
                longitude,
                status
            }
        });
        response.status(201).json({ message: "Ponto turístico criado." });
    }
    async listAll(_request, response) {
        const pontos = await prisma.pontoTuristico.findMany({
            orderBy: {
                createdAt: "asc"
            },
            where: {
                status: "APROVADO"
            }
        });
        response.json(pontos);
    }
    async listAllPendente(_request, response) {
        const pontos = await prisma.pontoTuristico.findMany({
            orderBy: {
                createdAt: "asc"
            },
            where: {
                status: "PENDENTE"
            }
        });
        response.json(pontos);
    }
    async getById(request, response) {
        const { id } = request.params;
        const ponto = await prisma.pontoTuristico.findUnique({
            where: { id: Number(id) }
        });
        if (!ponto) {
            return response.status(404).json({ message: "Ponto não encontrado." });
        }
        response.json(ponto);
    }
    async delete(request, response) {
        const { id } = request.params;
        await prisma.pontoTuristico.delete({
            where: { id: Number(id) }
        });
        response.json({ message: "Ponto deletado." });
    }
    async aprovar(request, response) {
        const { id } = request.params;
        await prisma.pontoTuristico.update({
            where: { id: Number(id) },
            data: { status: "APROVADO" }
        });
        return response.json({ message: "Ponto turístico aprovado!" });
    }
}
export { PontosTuristicosController };
//# sourceMappingURL=pontos-turisticos-controller.js.map