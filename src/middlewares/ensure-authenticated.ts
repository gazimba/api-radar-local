import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import authConfig from "../config/auth";
import { prisma } from "../database/prisma";

const { verify } = jwt;

interface TokenPayload {
    sub: string;
}

export async function ensureAuthenticated(
    request: Request,
    response: Response,
    next: NextFunction
) {
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
        const decoded = verify(token, authConfig.jwt.secret) as TokenPayload;
        const userId = Number(decoded.sub);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, ativo: true },
        });

        if (!user || !user.ativo) {
            return response.status(401).json({ message: "Conta inativa ou não encontrada" });
        }

        request.user = { id: user.id };

        return next();
    } catch {
        return response.status(401).json({ message: "Token inválido ou expirado" });
    }
}