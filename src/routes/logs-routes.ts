import { Router } from "express";
import { prisma } from "@/database/prisma";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { authorize } from "@/middlewares/authorize";

const logsRoutes = Router();

logsRoutes.get("/", ensureAuthenticated, authorize("ADMINISTRADOR"), async (_req, res) => {
    const logs = await prisma.logAcao.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { user: { select: { id: true, nome: true } } },
    });
    return res.json(logs);
});

export { logsRoutes };
