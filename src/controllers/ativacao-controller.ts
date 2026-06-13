import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { enviarEmailAtivacao } from "@/utils/mailer";

class AtivacaoController {
    async reenviar(request: Request, response: Response) {
        const { email } = z.object({ email: z.email() }).parse(request.body);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.ativo) {
            return response.json({ message: "Se este e-mail tiver uma conta pendente, o link será reenviado." });
        }

        const tokenAtivacao = randomUUID();
        await prisma.user.update({ where: { id: user.id }, data: { tokenAtivacao } });

        enviarEmailAtivacao(email, user.nome, tokenAtivacao).catch(err =>
            console.error("[mailer] Erro ao reenviar email de ativacao:", err)
        );

        return response.json({ message: "E-mail de ativação reenviado! Verifique sua caixa de entrada." });
    }

    async ativar(request: Request, response: Response) {
        const { token } = request.query;

        if (!token || typeof token !== "string") {
            return response.status(400).json({ message: "Token inválido." });
        }

        const user = await prisma.user.findUnique({
            where: { tokenAtivacao: token },
        });

        if (!user) {
            return response.status(404).json({ message: "Token não encontrado ou já utilizado." });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                ativo: true,
                tokenAtivacao: null,
            },
        });

        return response.json({ message: "Conta ativada com sucesso! Você já pode fazer login." });
    }
}

export { AtivacaoController };
