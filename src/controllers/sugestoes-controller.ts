import type { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";
import { logAcao } from "@/utils/log-acao";
import { enviarEmailSugestaoRejeitada } from "@/utils/mailer";

export class SugestoesController {
    async create(request: Request, response: Response) {
        const schema = z.object({
            categoria: z.enum(["evento", "ponto-turistico", "hotel-pousada", "bar-restaurante"]),
            nome: z.string().min(2),
            descricao: z.string(),
            informacoes: z.string(),
            latitude: z.number().optional(),
            longitude: z.number().optional(),
            // evento
            data: z.string().optional(),
            horario: z.string().optional(),
            local: z.string().optional(),
            link: z.string().optional(),
            gratuito: z.boolean().optional(),
            // ponto turístico
            destaques: z.string().optional(),
            endereco: z.string().optional(),
            horarioFuncionamento: z.string().optional(),
            telefone: z.string().optional(),
            site: z.string().optional(),
        });

        try {
            const data = schema.parse(request.body);
            const sugestorId = request.user!.id;

            const cidade = await prisma.cidade.findFirst({
                where: { slug: "congonhas-mg" },
            });

            const cidadeId = cidade?.id ?? 1;

            const categoriaMap: Record<string, "PONTO_TURISTICO" | "HOTEL_POUSADA" | "BAR_RESTAURANTE"> = {
                "ponto-turistico": "PONTO_TURISTICO",
                "hotel-pousada": "HOTEL_POUSADA",
                "bar-restaurante": "BAR_RESTAURANTE",
            };

            if (data.categoria === "evento") {
                const novoEvento = await prisma.evento.create({
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
            } else {
                const categoria = categoriaMap[data.categoria] ?? "PONTO_TURISTICO";
                const novoPonto = await prisma.pontoTuristico.create({
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
        } catch (error) {
            return response.status(400).json({ message: "Erro ao processar sugestão." });
        }
    }

    async listAll(_request: Request, response: Response) {
        const [eventos, pontos] = await Promise.all([
            prisma.evento.findMany({ where: { status: "PENDENTE" } }),
            prisma.pontoTuristico.findMany({ where: { status: "PENDENTE" } })
        ]);
        return response.json({ eventos, pontos });
    }

    async rejeitar(request: Request, response: Response) {
        const { id, tipo } = z.object({ id: z.coerce.number(), tipo: z.enum(["evento", "ponto-turistico"]) }).parse(request.params);
        const userId = request.user!.id;
        if (tipo === "evento") {
            const evento = await prisma.evento.update({
                where: { id },
                data: { status: "REJEITADO" },
                include: { sugestor: { select: { email: true, nome: true } } },
            });
            await logAcao(userId, "REJEITAR_SUGESTAO", `Evento ID ${id}`);
            if (evento.sugestor) {
                enviarEmailSugestaoRejeitada(evento.sugestor.email, evento.sugestor.nome, evento.nome).catch(() => {});
            }
        } else {
            const ponto = await prisma.pontoTuristico.update({
                where: { id },
                data: { status: "REJEITADO" },
                include: { sugestor: { select: { email: true, nome: true } } },
            });
            await logAcao(userId, "REJEITAR_SUGESTAO", `Ponto ID ${id}`);
            if (ponto.sugestor) {
                enviarEmailSugestaoRejeitada(ponto.sugestor.email, ponto.sugestor.nome, ponto.nome).catch(() => {});
            }
        }
        return response.json({ message: "Sugestão rejeitada." });
    }
}
