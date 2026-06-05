"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
const prisma_1 = require("../database/prisma");
function authorize(...roles) {
    return async (request, response, next) => {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(401).json({ message: "Não autenticado" });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { cargo: true, ativo: true },
        });
        if (!user || !user.ativo || !roles.includes(user.cargo)) {
            return response.status(403).json({ message: "Acesso negado" });
        }
        return next();
    };
}
//# sourceMappingURL=authorize.js.map