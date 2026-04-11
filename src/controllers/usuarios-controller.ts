import type { Request, Response } from "express";
import { z } from "zod";
import { hash } from "bcrypt";
import { prisma } from "@/database/prisma";

class UsuariosController {
    async create(request: Request, response: Response) {
        const createUsuarioSchema = z.object({
            nome: z.string().min(1, { message: "O nome é obrigatório" }),
            email: z.string().email({ message: "E-mail inválido" }),
            senha: z.string().min(6, { message: "A senha deve conter no mínimo 6 caracteres" }),
        });

        const { nome, email, senha } = createUsuarioSchema.parse(request.body);

        const userExists = await prisma.user.findFirst({ where: { email } });

        if (userExists) {
            return response.status(409).json({ message: "Esse e-mail já está em uso" });
        }

        const hashedPassword = await hash(senha, 8);

        await prisma.user.create({
            data: {
                nome,
                email,
                senha: hashedPassword,
            }
        });

        return response.status(201).json({ message: "Usuário criado com sucesso." });
    }

    async listAll(request: Request, response: Response) {
        const usuarios = await prisma.user.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
            },
            orderBy: {
                nome: "asc"
            }
        });

        return response.json(usuarios);
    }

    async getById(request: Request, response: Response) {
        const { id } = request.params;

        const usuario = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                nome: true,
                email: true
            }
        });

        if (!usuario) {
            return response.status(404).json({ message: "Usuário não encontrado." });
        }

        return response.json(usuario);
    }

    async delete(request: Request, response: Response) {
        const { id } = request.params;

        const userExists = await prisma.user.findUnique({
            where: { id: Number(id) }
        });

        if (!userExists) {
            return response.status(404).json({ message: "Usuário não encontrado." });
        }

        await prisma.user.delete({
            where: { id: Number(id) }
        });

        return response.json({ message: "Usuário deletado com sucesso." });
    }
}

export { UsuariosController };