import type { Request, Response } from "express";
import { prisma } from "@/database/prisma";

class AtivacaoController {
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
