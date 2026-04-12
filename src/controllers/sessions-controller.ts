import type { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import authConfig from "@/config/auth";

const { sign } = jwt;

class SessionsController {
    async create(request: Request, response: Response) {
        const sessionSchema = z.object({
            email: z.email(),
            senha: z.string()
        });

        const { email, senha } = sessionSchema.parse(request.body);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return response.status(401).json({ message: "E-mail e/ou senha incorretos" });
        }

        const passwordMatched = await compare(senha, user.senha);

        if (!passwordMatched) {
            return response.status(401).json({ message: "E-mail e/ou senha incorretos" });
        }

        const token = sign({}, authConfig.jwt.secret, {
            subject: String(user.id),
            expiresIn: authConfig.jwt.expiresIn,
        });

        const { senha: _, ...userWithoutPassword } = user;

        return response.json({
            user: userWithoutPassword,
            token
        });
    }
}

export { SessionsController };