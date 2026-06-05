"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SugestoesController = void 0;
const prisma_1 = require("../database/prisma");
const zod_1 = require("zod");
const log_acao_1 = require("../utils/log-acao");
const mailer_1 = require("../utils/mailer");
class SugestoesController {
    async create(request, response) {
        const schema = zod_1.z.object({
            categoria: zod_1.z.enum(["evento", "ponto-turistico", "hotel-pousada", "bar-restaurante"]),
            nome: zod_1.z.string().min(2),
            descricao: zod_1.z.string(),
            informacoes: zod_1.z.string(),
            latitude: zod_1.z.number().optional(),
            longitude: zod_1.z.number().optional(),
            // evento
            data: zod_1.z.string().optional(),
            horario: zod_1.z.string().optional(),
            local: zod_1.z.string().optional(),
            link: zod_1.z.string().optional(),
            gratuito: zod_1.z.boolean().optional(),
            // ponto turístico
            destaques: zod_1.z.string().optional(),
            endereco: zod_1.z.string().optional(),
            horarioFuncionamento: zod_1.z.string().optional(),
            telefone: zod_1.z.string().optional(),
            site: zod_1.z.string().optional(),
        });
        try {
            const data = schema.parse(request.body);
            const sugestorId = request.user.id;
            const cidade = await prisma_1.prisma.cidade.findFirst({
                where: { slug: "congonhas-mg" },
            });
            const cidadeId = cidade?.id ?? 1;
            const categoriaMap = {
                "ponto-turistico": "PONTO_TURISTICO",
                "hotel-pousada": "HOTEL_POUSADA",
                "bar-restaurante": "BAR_RESTAURANTE",
            };
            if (data.categoria === "evento") {
                const novoEvento = await prisma_1.prisma.evento.create({
                    data: {
                        nome: data.nome,
                        descricao: data.descricao,
                        informacoes: data.informacoes,
                        data: data.data ? new Date(data.data) : new Date(),
                        horario: data.horario || "A definir",
                        local: data.local || null,
                        link: data.link || null,
                        gratuito: data.gratuito ?? false,
                        latitude: data.latitude || 0,
                        longitude: data.longitude || 0,
                        status: "PENDENTE",
                        cidadeId,
                        sugestorId,
                    }
                });
                return response.status(201).json({ message: "Sugestão enviada com sucesso!", id: novoEvento.id, tipo: "evento" });
            }
            else {
                const categoria = categoriaMap[data.categoria] ?? "PONTO_TURISTICO";
                const novoPonto = await prisma_1.prisma.pontoTuristico.create({
                    data: {
                        nome: data.nome,
                        descricao: data.descricao,
                        informacoes: data.informacoes,
                        destaques: data.destaques || "",
                        endereco: data.endereco || null,
                        horarioFuncionamento: data.horarioFuncionamento || null,
                        telefone: data.telefone || null,
                        site: data.site || null,
                        latitude: data.latitude || 0,
                        longitude: data.longitude || 0,
                        categoria,
                        status: "PENDENTE",
                        cidadeId,
                        sugestorId,
                    }
                });
                return response.status(201).json({ message: "Sugestão enviada com sucesso!", id: novoPonto.id, tipo: "ponto-turistico" });
            }
        }
        catch (error) {
            return response.status(400).json({ message: "Erro ao processar sugestão." });
        }
    }
    async listAll(_request, response) {
        const [eventos, pontos] = await Promise.all([
            prisma_1.prisma.evento.findMany({ where: { status: "PENDENTE" } }),
            prisma_1.prisma.pontoTuristico.findMany({ where: { status: "PENDENTE" } })
        ]);
        return response.json({ eventos, pontos });
    }
    async rejeitar(request, response) {
        const { id, tipo } = zod_1.z.object({ id: zod_1.z.coerce.number(), tipo: zod_1.z.enum(["evento", "ponto-turistico"]) }).parse(request.params);
        const userId = request.user.id;
        if (tipo === "evento") {
            const evento = await prisma_1.prisma.evento.update({
                where: { id },
                data: { status: "REJEITADO" },
                include: { sugestor: { select: { email: true, nome: true } } },
            });
            await (0, log_acao_1.logAcao)(userId, "REJEITAR_SUGESTAO", `Evento ID ${id}`);
            if (evento.sugestor) {
                (0, mailer_1.enviarEmailSugestaoRejeitada)(evento.sugestor.email, evento.sugestor.nome, evento.nome).catch(() => { });
            }
        }
        else {
            const ponto = await prisma_1.prisma.pontoTuristico.update({
                where: { id },
                data: { status: "REJEITADO" },
                include: { sugestor: { select: { email: true, nome: true } } },
            });
            await (0, log_acao_1.logAcao)(userId, "REJEITAR_SUGESTAO", `Ponto ID ${id}`);
            if (ponto.sugestor) {
                (0, mailer_1.enviarEmailSugestaoRejeitada)(ponto.sugestor.email, ponto.sugestor.nome, ponto.nome).catch(() => { });
            }
        }
        return response.json({ message: "Sugestão rejeitada." });
    }
}
exports.SugestoesController = SugestoesController;
//# sourceMappingURL=sugestoes-controller.js.map