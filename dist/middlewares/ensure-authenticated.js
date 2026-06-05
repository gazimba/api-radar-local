"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = ensureAuthenticated;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = __importDefault(require("../config/auth"));
const prisma_1 = require("../database/prisma");
const { verify } = jsonwebtoken_1.default;
async function ensureAuthenticated(request, response, next) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        return response.status(401).json({ message: "Token não informado" });
    }
    const parts = authHeader.split(" ");
    if (parts.length !== 2) {
        return response.status(401).json({ message: "Formato de token inválido" });
    }
    const token = parts[1];
    if (!token) {
        return response.status(401).json({ message: "Token malformado" });
    }
    try {
        const decoded = verify(token, auth_1.default.jwt.secret);
        const userId = Number(decoded.sub);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, ativo: true },
        });
        if (!user || !user.ativo) {
            return response.status(401).json({ message: "Conta inativa ou não encontrada" });
        }
        request.user = { id: user.id };
        return next();
    }
    catch {
        return response.status(401).json({ message: "Token inválido ou expirado" });
    }
}
//# sourceMappingURL=ensure-authenticated.js.map