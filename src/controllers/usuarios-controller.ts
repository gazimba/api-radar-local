import type { Request, Response } from "express";
import { z } from "zod";
import { hash } from "bcrypt";
import { AppError } from "@/util/AppError";
import { prisma } from "@/database/prisma";

class UsuariosController {
    async create(request: Request, response: Response) {
        const createUsuarioSchema = z.object({
            nome: z.string().min(1, { message: "O nome é obrigatório" }),
            email: z.email({ message: "E-mail inválido" }),
            password: z.string().min(6, { message: "A senha deve conter no mínimo 6 caracteres" }),
        });

        const { nome, email, password } = createUsuarioSchema.parse(request.body);

        const userExists = await prisma.user.findFirst({ where: { email } });
        if (userExists) {
            throw new AppError("Esse e-mail já está em uso", 409);
        }

        const hashedPassword = await hash(password, 8);

        await prisma.user.create({
            data: {
                nome,
                email,
                senha: hashedPassword,
            }
        });

        response.status(201).json({ message: "Usuário criado." });
    }

}

export { UsuariosController };