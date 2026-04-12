import { z } from "zod";
import { prisma } from "../database/prisma";
class EventosController {
    async create(request, response) {
        const createEventoSchema = z.object({
            nome: z.string().min(2),
            descricao: z.string().max(200),
            data: z.string(),
            horario: z.string(),
            informacoes: z.string().max(200),
            latitude: z.number(),
            longitude: z.number(),
            status: z.enum(["PENDENTE", "APROVADO", "REJEITADO"]).default("PENDENTE")
        });
        const { nome, descricao, data, horario, informacoes, latitude, longitude, status } = createEventoSchema.parse(request.body);
        await prisma.evento.create({
            data: {
                nome,
                descricao,
                data: new Date(data),
                horario,
                informacoes,
                latitude,
                longitude,
                status
            }
        });
        response.status(201).json({ message: "Evento criado com sucesso." });
    }
    async listAll(_request, response) {
        const eventos = await prisma.evento.findMany({
            orderBy: {
                data: "asc"
            },
            where: {
                status: "APROVADO"
            }
        });
        response.json(eventos);
    }
    async listAllPendente(_request, response) {
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
    async getById(request, response) {
        const { id } = request.params;
        const evento = await prisma.evento.findUnique({
            where: { id: Number(id) }
        });
        if (!evento) {
            return response.status(404).json({ message: "Evento não encontrado." });
        }
        response.json(evento);
    }
    async delete(request, response) {
        const { id } = request.params;
        const eventoExistente = await prisma.evento.findUnique({
            where: { id: Number(id) }
        });
        if (!eventoExistente) {
            return response.status(404).json({ message: "Evento não encontrado." });
        }
        await prisma.evento.delete({
            where: { id: Number(id) }
        });
        response.json({ message: "Evento deletado com sucesso." });
    }
    async aprovar(request, response) {
        const { id } = request.params;
        await prisma.evento.update({
            where: { id: Number(id) },
            data: { status: "APROVADO" }
        });
        return response.json({ message: "Evento aprovado!" });
    }
}
export { EventosController };
//# sourceMappingURL=eventos-controller.js.map