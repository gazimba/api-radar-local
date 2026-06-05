"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAcao = logAcao;
const prisma_1 = require("../database/prisma");
async function logAcao(userId, acao, detalhes) {
    try {
        await prisma_1.prisma.logAcao.create({ data: { userId, acao, detalhes: detalhes ?? null } });
    }
    catch {
        // log não deve quebrar a operação principal
    }
}
//# sourceMappingURL=log-acao.js.map