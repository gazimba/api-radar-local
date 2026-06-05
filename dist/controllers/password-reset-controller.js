"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetController = void 0;
const prisma_1 = require("../database/prisma");
const zod_1 = require("zod");
const bcrypt_1 = require("bcrypt");
const crypto_1 = require("crypto");
const mailer_1 = require("../utils/mailer");
class PasswordResetController {
    async solicitar(request, response) {
        const { email } = zod_1.z.object({ email: zod_1.z.email() }).parse(request.body);
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        // Resposta genérica para não revelar se o email existe
        if (!user || !user.ativo) {
            return response.json({ message: "Se este e-mail estiver cadastrado, você receberá as instruções em breve." });
        }
        if (!user.senha) {
            return response.json({ message: "Esta conta usa login pelo Google. Não é possível redefinir a senha por e-mail." });
        }
        const token = (0, crypto_1.randomUUID)();
        const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { tokenResetSenha: token, tokenResetExpira: expira },
        });
        await (0, mailer_1.enviarEmailResetSenha)(user.email, user.nome, token);
        return response.json({ message: "Se este e-mail estiver cadastrado, você receberá as instruções em breve." });
    }
    async redefinir(request, response) {
        const schema = zod_1.z.object({
            token: zod_1.z.string().uuid(),
            novaSenha: zod_1.z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
        });
        const { token, novaSenha } = schema.parse(request.body);
        const user = await prisma_1.prisma.user.findUnique({ where: { tokenResetSenha: token } });
        if (!user || !user.tokenResetExpira) {
            return response.status(400).json({ message: "Token inválido ou expirado." });
        }
        if (user.tokenResetExpira < new Date()) {
            return response.status(400).json({ message: "Token expirado. Solicite um novo link de redefinição." });
        }
        const senhaHash = await (0, bcrypt_1.hash)(novaSenha, 10);
        await prisma_1.prisma.user.update({
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
exports.PasswordResetController = PasswordResetController;
//# sourceMappingURL=password-reset-controller.js.map