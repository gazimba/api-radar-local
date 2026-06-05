import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/database/prisma";

type Cargo = "COMUM" | "MODERADOR" | "ADMINISTRADOR";

export function authorize(...roles: Cargo[]) {
    return async (request: Request, response: Response, next: NextFunction) => {
        const userId = request.user?.id;

        if (!userId) {
            return response.status(401).json({ message: "Não autenticado" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { cargo: true, ativo: true },
        });

        if (!user || !user.ativo || !roles.includes(user.cargo as Cargo)) {
            return response.status(403).json({ message: "Acesso negado" });
        }

        return next();
    };
}
