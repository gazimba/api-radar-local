import type { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import authConfig from "@/config/auth";

const { sign } = jwt;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function gerarToken(userId: number) {
    return sign({}, authConfig.jwt.secret, {
        subject: String(userId),
        expiresIn: authConfig.jwt.expiresIn,
    });
}

class SessionsController {
    async create(request: Request, response: Response) {
        const sessionSchema = z.object({
            email: z.email(),
            senha: z.string(),
        });

        const { email, senha } = sessionSchema.parse(request.body);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.senha) {
            return response.status(401).json({ message: "E-mail e/ou senha incorretos" });
        }

        const passwordMatched = await compare(senha, user.senha);

        if (!passwordMatched) {
            return response.status(401).json({ message: "E-mail e/ou senha incorretos" });
        }

        if (!user.ativo) {
            return response.status(403).json({ message: "Conta não ativada. Verifique seu e-mail." });
        }

        const token = gerarToken(user.id);
        const { senha: _, ...userWithoutPassword } = user;

        return response.json({ user: userWithoutPassword, token });
    }

    async google(request: Request, response: Response) {
        const { credential } = z.object({ credential: z.string() }).parse(request.body);

        // Validar token com a API do Google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any;

        const payload = ticket.getPayload();
        if (!payload?.email) {
            return response.status(400).json({ message: "Token do Google inválido." });
        }

        const { email, name, picture, sub: googleId } = payload;

        // Verificar se já existe conta com esse googleId
        const userPorGoogleId = await prisma.user.findUnique({ where: { googleId } });
        if (userPorGoogleId) {
            const token = gerarToken(userPorGoogleId.id);
            const { senha: _, ...userData } = userPorGoogleId;
            return response.json({ user: userData, token });
        }

        // Verificar se existe conta com esse email
        const userPorEmail = await prisma.user.findUnique({ where: { email } });
        if (userPorEmail) {
            // Conta existe mas sem googleId → precisa vincular
            return response.status(409).json({
                message: "Já existe uma conta com este e-mail. Digite sua senha para vincular ao Google.",
                email,
                googleId,
                foto: picture,
            });
        }

        // Criar nova conta via Google (já ativa, email verificado pelo Google)
        const novoUser = await prisma.user.create({
            data: {
                email,
                nome: name || email.split("@")[0],
                googleId,
                foto: picture,
                ativo: true,
            },
        });

        const token = gerarToken(novoUser.id);
        const { senha: _, ...userData } = novoUser;
        return response.status(201).json({ user: userData, token });
    }

    async vincularGoogle(request: Request, response: Response) {
        const schema = z.object({
            email: z.email(),
            senha: z.string(),
            googleId: z.string(),
            foto: z.string().optional(),
        });

        const { email, senha, googleId, foto } = schema.parse(request.body);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.senha) {
            return response.status(401).json({ message: "E-mail e/ou senha incorretos" });
        }

        const passwordMatched = await compare(senha, user.senha);
        if (!passwordMatched) {
            return response.status(401).json({ message: "Senha incorreta." });
        }

        if (!user.ativo) {
            return response.status(403).json({ message: "Conta não ativada. Verifique seu e-mail." });
        }

        const atualizado = await prisma.user.update({
            where: { id: user.id },
            data: {
                googleId,
                foto: foto || user.foto,
            },
        });

        const token = gerarToken(atualizado.id);
        const { senha: _, ...userData } = atualizado;
        return response.json({ user: userData, token });
    }
}

export { SessionsController };
