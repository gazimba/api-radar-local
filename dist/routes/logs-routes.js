"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logsRoutes = void 0;
const express_1 = require("express");
const prisma_1 = require("../database/prisma");
const ensure_authenticated_1 = require("../middlewares/ensure-authenticated");
const authorize_1 = require("../middlewares/authorize");
const logsRoutes = (0, express_1.Router)();
exports.logsRoutes = logsRoutes;
logsRoutes.get("/", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR"), async (_req, res) => {
    const logs = await prisma_1.prisma.logAcao.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { user: { select: { id: true, nome: true } } },
    });
    return res.json(logs);
});
//# sourceMappingURL=logs-routes.js.map