"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtivacaoController = void 0;
const prisma_1 = require("../database/prisma");
class AtivacaoController {
    async ativar(request, response) {
        const { token } = request.query;
        if (!token || typeof token !== "string") {
            return response.status(400).json({ message: "Token inválido." });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { tokenAtivacao: token },
        });
        if (!user) {
            return response.status(404).json({ message: "Token não encontrado ou já utilizado." });
        }
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                ativo: true,
                tokenAtivacao: null,
            },
        });
        return response.json({ message: "Conta ativada com sucesso! Você já pode fazer login." });
    }
}
exports.AtivacaoController = AtivacaoController;
//# sourceMappingURL=ativacao-controller.js.map