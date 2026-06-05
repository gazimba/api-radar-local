import type { Request, Response } from "express";
import { z } from "zod";
import { hash, compare } from "bcrypt";
import { randomUUID } from "crypto";
import { prisma } from "@/database/prisma";
import { enviarEmailAtivacao } from "@/utils/mailer";
import { logAcao } from "@/utils/log-acao";

class UsuariosController {
    async register(request: Request, response: Response) {
        const registerSchema = z.object({
            nome: z.string().min(1, { message: "O nome é obrigatório" }).trim(),
            email: z.email({ message: "E-mail inválido" }).toLowerCase(),
            senha: z.string().min(8, { message: "A senha deve conter no mínimo 8 caracteres" }),
        });

        const { nome, email, senha } = registerSchema.parse(request.body);

        const userExists = await prisma.user.findFirst({ where: { email } });

        if (userExists) {
            return response.status(409).json({ message: "Esse e-mail já está em uso" });
        }

        const hashedPassword = await hash(senha, 10);
        const tokenAtivacao = randomUUID();

        await prisma.user.create({
            data: {
                nome,
                email,
                senha: hashedPassword,
                tokenAtivacao,
                ativo: false,
            },
        });

        await enviarEmailAtivacao(email, nome, tokenAtivacao);

        return response.status(201).json({
            message: "Conta criada! Verifique seu e-mail para ativar o acesso.",
        });
    }

    async create(request: Request, response: Response) {
        const createUsuarioSchema = z.object({
            nome: z.string().min(1, { message: "O nome é obrigatório" }).trim(),
            email: z.email({ message: "E-mail inválido" }).toLowerCase(),
            senha: z.string().min(6, { message: "A senha deve conter no mínimo 6 caracteres" }),
            cargo: z.enum(["COMUM", "MODERADOR", "ADMINISTRADOR"]).optional().default("COMUM"),
        });

        const { nome, email, senha, cargo } = createUsuarioSchema.parse(request.body);

        const userExists = await prisma.user.findFirst({ where: { email } });

        if (userExists) {
            return response.status(409).json({ message: "Esse e-mail já está em uso" });
        }

        const hashedPassword = await hash(senha, 10);

        await prisma.user.create({
            data: { nome, email, senha: hashedPassword, cargo, ativo: true },
        });

        return response.status(201).json({ message: "Usuário criado com sucesso." });
    }

    async listAll(_request: Request, response: Response) {
        const usuarios = await prisma.user.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                cargo: true,
                ativo: true,
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

    async alterarSenha(request: Request, response: Response) {
        const alterarSenhaSchema = z.object({
            senhaAtual: z.string().min(1, { message: "Senha atual é obrigatória" }),
            novaSenha: z.string().min(8, { message: "A nova senha deve ter no mínimo 8 caracteres" }),
        });

        const { senhaAtual, novaSenha } = alterarSenhaSchema.parse(request.body);

        const usuario = await prisma.user.findUnique({
            where: { id: request.user.id },
        });

        if (!usuario) {
            return response.status(404).json({ message: "Usuário não encontrado." });
        }

        if (!usuario.senha) {
            return response.status(400).json({ message: "Sua conta não possui senha. Use o login com Google." });
        }

        const senhaCorreta = await compare(senhaAtual, usuario.senha);

        if (!senhaCorreta) {
            return response.status(401).json({ message: "Senha atual incorreta." });
        }

        const novaSenhaHash = await hash(novaSenha, 10);

        await prisma.user.update({
            where: { id: request.user.id },
            data: { senha: novaSenhaHash },
        });

        return response.json({ message: "Senha alterada com sucesso!" });
    }

    async alterarCargo(request: Request, response: Response) {
        const { id } = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
        const { cargo } = z.object({ cargo: z.enum(["COMUM", "MODERADOR", "ADMINISTRADOR"]) }).parse(request.body);

        const usuario = await prisma.user.findUnique({ where: { id } });

        if (!usuario) {
            return response.status(404).json({ message: "Usuário não encontrado." });
        }

        const atualizado = await prisma.user.update({
            where: { id },
            data: { cargo },
            select: { id: true, nome: true, email: true, cargo: true },
        });

        await logAcao(request.user!.id, "ALTERAR_CARGO", `Usuário ID ${id}: cargo -> ${cargo}`);
        return response.json({ message: "Cargo atualizado com sucesso.", user: atualizado });
    }

    async alterarAtivo(request: Request, response: Response) {
        const { id } = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
        const { ativo } = z.object({ ativo: z.boolean() }).parse(request.body);

        const usuario = await prisma.user.findUnique({ where: { id } });

        if (!usuario) {
            return response.status(404).json({ message: "Usuário não encontrado." });
        }

        const atualizado = await prisma.user.update({
            where: { id },
            data: { ativo },
            select: { id: true, nome: true, email: true, cargo: true, ativo: true },
        });

        const msg = ativo ? "Usuário desbloqueado com sucesso." : "Usuário bloqueado com sucesso.";
        await logAcao(request.user!.id, ativo ? "DESBLOQUEAR_USUARIO" : "BLOQUEAR_USUARIO", `Usuário ID ${id}`);
        return response.json({ message: msg, user: atualizado });
    }

    async uploadFoto(request: Request, response: Response) {
        if (!request.file) {
            return response.status(400).json({ message: "Nenhuma imagem enviada." });
        }

        const { cloudinary } = await import("@/config/cloudinary");

        const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "radar-local/avatars", resource_type: "image", transformation: [{ width: 200, height: 200, crop: "fill" }] },
                (error, result) => {
                    if (error || !result) return reject(error);
                    resolve({ secure_url: result.secure_url, public_id: result.public_id });
                }
            );
            stream.end(request.file!.buffer);
        });

        const atualizado = await prisma.user.update({
            where: { id: request.user.id },
            data: { foto: uploadResult.secure_url },
            select: { id: true, nome: true, email: true, cargo: true, foto: true, googleId: true },
        });

        return response.json({ message: "Foto atualizada!", user: atualizado });
    }

    async atualizarPerfil(request: Request, response: Response) {
        const schema = z.object({
            nome: z.string().min(1, { message: "Nome é obrigatório" }).optional(),
            foto: z.string().url().optional(),
        });

        const { nome, foto } = schema.parse(request.body);

        const atualizado = await prisma.user.update({
            where: { id: request.user.id },
            data: { ...(nome && { nome }), ...(foto && { foto }) },
            select: { id: true, nome: true, email: true, cargo: true, foto: true, googleId: true },
        });

        return response.json({ message: "Perfil atualizado!", user: atualizado });
    }

    async silenciar(request: Request, response: Response) {
        const { id } = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
        const { duracaoHoras } = z.object({
            duracaoHoras: z.number().nullable(),
        }).parse(request.body);

        const moderadorId = request.user!.id;

        const alvo = await prisma.user.findUnique({ where: { id }, select: { nome: true, cargo: true } });
        if (!alvo) return response.status(404).json({ message: "Usuário não encontrado." });
        if (alvo.cargo === "ADMINISTRADOR" || alvo.cargo === "MODERADOR") {
            return response.status(403).json({ message: "Não é possível silenciar um moderador ou administrador." });
        }

        const silenciadoAte = duracaoHoras === null
            ? new Date("2099-01-01T00:00:00Z")
            : new Date(Date.now() + duracaoHoras * 60 * 60 * 1000);

        await prisma.user.update({ where: { id }, data: { silenciadoAte } });

        const descricao = duracaoHoras === null ? "permanentemente" : `por ${duracaoHoras}h`;
        await logAcao(moderadorId, "SILENCIAR_USUARIO", `Usuário ID ${id} (${alvo.nome}) silenciado ${descricao}`);

        return response.json({ message: `Usuário silenciado ${descricao}.` });
    }

    async dessilenciar(request: Request, response: Response) {
        const { id } = z.object({ id: z.coerce.number().int().positive() }).parse(request.params);
        const moderadorId = request.user!.id;

        const alvo = await prisma.user.findUnique({ where: { id }, select: { nome: true } });
        if (!alvo) return response.status(404).json({ message: "Usuário não encontrado." });

        await prisma.user.update({ where: { id }, data: { silenciadoAte: null } });
        await logAcao(moderadorId, "DESSILENCIAR_USUARIO", `Usuário ID ${id} (${alvo.nome}) dessilenciado`);

        return response.json({ message: "Usuário dessilenciado." });
    }
}

export { UsuariosController };