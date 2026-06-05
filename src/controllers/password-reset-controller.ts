import type { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";
import { hash } from "bcrypt";
import { randomUUID } from "crypto";
import { enviarEmailResetSenha } from "@/utils/mailer";

class PasswordResetController {
    async solicitar(request: Request, response: Response) {
        const { email } = z.object({ email: z.email() }).parse(request.body);

        const user = await prisma.user.findUnique({ where: { email } });

        // Resposta genérica para não revelar se o email existe
        if (!user || !user.ativo) {
            return response.json({ message: "Se este e-mail estiver cadastrado, você receberá as instruções em breve." });
        }

        if (!user.senha) {
            return response.json({ message: "Esta conta usa login pelo Google. Não é possível redefinir a senha por e-mail." });
        }

        const token = randomUUID();
        const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await prisma.user.update({
            where: { id: user.id },
            data: { tokenResetSenha: token, tokenResetExpira: expira },
        });

        await enviarEmailResetSenha(user.email, user.nome, token);

        return response.json({ message: "Se este e-mail estiver cadastrado, você receberá as instruções em breve." });
    }

    async redefinir(request: Request, response: Response) {
        const schema = z.object({
            token: z.string().uuid(),
            novaSenha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
        });

        const { token, novaSenha } = schema.parse(request.body);

        const user = await prisma.user.findUnique({ where: { tokenResetSenha: token } });

        if (!user || !user.tokenResetExpira) {
            return response.status(400).json({ message: "Token inválido ou expirado." });
        }

        if (user.tokenResetExpira < new Date()) {
            return response.status(400).json({ message: "Token expirado. Solicite um novo link de redefinição." });
        }

        const senhaHash = await hash(novaSenha, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                senha: senhaHash,
                tokenResetSenha: null,
                tokenResetExpira: null,
            },
        });

        return response.json({ message: "Senha redefinida com sucesso! Você já pode fazer login." });
    }
}

export { PasswordResetController };
