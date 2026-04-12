import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import authConfig from "../config/auth";

const { verify } = jwt;

interface TokenPayload {
    sub: string;
}

export function ensureAuthenticated(
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

        request.user = {
            id: Number(decoded.sub),
        };

        return next();
    } catch {
        return response.status(401).json({ message: "Token inválido ou expirado" });
    }
}