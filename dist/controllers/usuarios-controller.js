"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosController = void 0;
const zod_1 = require("zod");
const bcrypt_1 = require("bcrypt");
const crypto_1 = require("crypto");
const prisma_1 = require("../database/prisma");
const mailer_1 = require("../utils/mailer");
const log_acao_1 = require("../utils/log-acao");
class UsuariosController {
    async register(request, response) {
        const registerSchema = zod_1.z.object({
            nome: zod_1.z.string().min(1, { message: "O nome é obrigatório" }).trim(),
            email: zod_1.z.email({ message: "E-mail inválido" }).toLowerCase(),
            senha: zod_1.z.string().min(8, { message: "A senha deve conter no mínimo 8 caracteres" }),
        });
        const { nome, email, senha } = registerSchema.parse(request.body);
        const userExists = await prisma_1.prisma.user.findFirst({ where: { email } });
        if (userExists) {
            return response.status(409).json({ message: "Esse e-mail já está em uso" });
        }
        const hashedPassword = await (0, bcrypt_1.hash)(senha, 10);
        const tokenAtivacao = (0, crypto_1.randomUUID)();
        await prisma_1.prisma.user.create({
            data: {
                nome,
                email,
                senha: hashedPassword,
                tokenAtivacao,
                ativo: false,
            },
        });
        await (0, mailer_1.enviarEmailAtivacao)(email, nome, tokenAtivacao);
        return response.status(201).json({
            message: "Conta criada! Verifique seu e-mail para ativar o acesso.",
        });
    }
    async create(request, response) {
        const createUsuarioSchema = zod_1.z.object({
            nome: zod_1.z.string().min(1, { message: "O nome é obrigatório" }).trim(),
            email: zod_1.z.email({ message: "E-mail inválido" }).toLowerCase(),
            senha: zod_1.z.string().min(6, { message: "A senha deve conter no mínimo 6 caracteres" }),
            cargo: zod_1.z.enum(["COMUM", "MODERADOR", "ADMINISTRADOR"]).optional().default("COMUM"),
        });
        const { nome, email, senha, cargo } = createUsuarioSchema.parse(request.body);
        const userExists = await prisma_1.prisma.user.findFirst({ where: { email } });
        if (userExists) {
            return response.status(409).json({ message: "Esse e-mail já está em uso" });
        }
        const hashedPassword = await (0, bcrypt_1.hash)(senha, 10);
        await prisma_1.prisma.user.create({
            data: { nome, email, senha: hashedPassword, cargo, ativo: true },
        });
        return response.status(201).json({ message: "Usuário criado com sucesso." });
    }
    async listAll(_request, response) {
        const usuarios = await prisma_1.prisma.user.findMany({
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
    async getById(request, response) {
        const { id } = request.params;
        const usuario = await prisma_1.prisma.user.findUnique({
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
    async delete(request, response) {
        const { id } = request.params;
        const userExists = await prisma_1.prisma.user.findUnique({
            where: { id: Number(id) }
        });
        if (!userExists) {
            return response.status(404).json({ message: "Usuário não encontrado." });
        }
        await prisma_1.prisma.user.delete({
            where: { id: Number(id) }
        });
        return response.json({ message: "Usuário deletado com sucesso." });
    }
    async alterarSenha(request, response) {
        const alterarSenhaSchema = zod_1.z.object({
            senhaAtual: zod_1.z.string().min(1, { message: "Senha atual é obrigatória" }),
            novaSenha: zod_1.z.string().min(8, { message: "A nova senha deve ter no mínimo 8 caracteres" }),
        });
        const { senhaAtual, novaSenha } = alterarSenhaSchema.parse(request.body);
        const usuario = await prisma_1.prisma.user.findUnique({
            where: { id: request.user.id },
        });
        if (!usuario) {
            return response.status(404).json({ message: "Usuário não encontrado." });
        }
        if (!usuario.senha) {
            return response.status(400).json({ message: "Sua conta não possui senha. Use o login com Google." });
        }
        const senhaCorreta = await (0, bcrypt_1.compare)(senhaAtual, usuario.senha);
        if (!senhaCorreta) {
            return response.status(401).json({ message: "Senha atual incorreta." });
        }
        const novaSenhaHash = await (0, bcrypt_1.hash)(novaSenha, 10);
        await prisma_1.prisma.user.update({
            where: { id: request.user.id },
            data: { senha: novaSenhaHash },
        });
        return response.json({ message: "Senha alterada com sucesso!" });
    }
    async alterarCargo(request, response) {
        const { id } = zod_1.z.object({ id: zod_1.z.coerce.number().int().positive() }).parse(request.params);
        const { cargo } = zod_1.z.object({ cargo: zod_1.z.enum(["COMUM", "MODERADOR", "ADMINISTRADOR"]) }).parse(request.body);
        const usuario = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!usuario) {
            return response.status(404).json({ message: "Usuário não encontrado." });
        }
        const atualizado = await prisma_1.prisma.user.update({
            where: { id },
            data: { cargo },
            select: { id: true, nome: true, email: true, cargo: true },
        });
        await (0, log_acao_1.logAcao)(request.user.id, "ALTERAR_CARGO", `Usuário ID ${id}: cargo -> ${cargo}`);
        return response.json({ message: "Cargo atualizado com sucesso.", user: atualizado });
    }
    async alterarAtivo(request, response) {
        const { id } = zod_1.z.object({ id: zod_1.z.coerce.number().int().positive() }).parse(request.params);
        const { ativo } = zod_1.z.object({ ativo: zod_1.z.boolean() }).parse(request.body);
        const usuario = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!usuario) {
            return response.status(404).json({ message: "Usuário não encontrado." });
        }
        const atualizado = await prisma_1.prisma.user.update({
            where: { id },
            data: { ativo },
            select: { id: true, nome: true, email: true, cargo: true, ativo: true },
        });
        const msg = ativo ? "Usuário desbloqueado com sucesso." : "Usuário bloqueado com sucesso.";
        await (0, log_acao_1.logAcao)(request.user.id, ativo ? "DESBLOQUEAR_USUARIO" : "BLOQUEAR_USUARIO", `Usuário ID ${id}`);
        return response.json({ message: msg, user: atualizado });
    }
    async uploadFoto(request, response) {
        if (!request.file) {
            return response.status(400).json({ message: "Nenhuma imagem enviada." });
        }
        const { cloudinary } = await Promise.resolve().then(() => __importStar(require("../config/cloudinary")));
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: "radar-local/avatars", resource_type: "image", transformation: [{ width: 200, height: 200, crop: "fill" }] }, (error, result) => {
                if (error || !result)
                    return reject(error);
                resolve({ secure_url: result.secure_url, public_id: result.public_id });
            });
            stream.end(request.file.buffer);
        });
        const atualizado = await prisma_1.prisma.user.update({
            where: { id: request.user.id },
            data: { foto: uploadResult.secure_url },
            select: { id: true, nome: true, email: true, cargo: true, foto: true, googleId: true },
        });
        return response.json({ message: "Foto atualizada!", user: atualizado });
    }
    async atualizarPerfil(request, response) {
        const schema = zod_1.z.object({
            nome: zod_1.z.string().min(1, { message: "Nome é obrigatório" }).optional(),
            foto: zod_1.z.string().url().optional(),
        });
        const { nome, foto } = schema.parse(request.body);
        const atualizado = await prisma_1.prisma.user.update({
            where: { id: request.user.id },
            data: { ...(nome && { nome }), ...(foto && { foto }) },
            select: { id: true, nome: true, email: true, cargo: true, foto: true, googleId: true },
        });
        return response.json({ message: "Perfil atualizado!", user: atualizado });
    }
    async silenciar(request, response) {
        const { id } = zod_1.z.object({ id: zod_1.z.coerce.number().int().positive() }).parse(request.params);
        const { duracaoHoras } = zod_1.z.object({
            duracaoHoras: zod_1.z.number().nullable(),
        }).parse(request.body);
        const moderadorId = request.user.id;
        const alvo = await prisma_1.prisma.user.findUnique({ where: { id }, select: { nome: true, cargo: true } });
        if (!alvo)
            return response.status(404).json({ message: "Usuário não encontrado." });
        if (alvo.cargo === "ADMINISTRADOR" || alvo.cargo === "MODERADOR") {
            return response.status(403).json({ message: "Não é possível silenciar um moderador ou administrador." });
        }
        const silenciadoAte = duracaoHoras === null
            ? new Date("2099-01-01T00:00:00Z")
            : new Date(Date.now() + duracaoHoras * 60 * 60 * 1000);
        await prisma_1.prisma.user.update({ where: { id }, data: { silenciadoAte } });
        const descricao = duracaoHoras === null ? "permanentemente" : `por ${duracaoHoras}h`;
        await (0, log_acao_1.logAcao)(moderadorId, "SILENCIAR_USUARIO", `Usuário ID ${id} (${alvo.nome}) silenciado ${descricao}`);
        return response.json({ message: `Usuário silenciado ${descricao}.` });
    }
    async dessilenciar(request, response) {
        const { id } = zod_1.z.object({ id: zod_1.z.coerce.number().int().positive() }).parse(request.params);
        const moderadorId = request.user.id;
        const alvo = await prisma_1.prisma.user.findUnique({ where: { id }, select: { nome: true } });
        if (!alvo)
            return response.status(404).json({ message: "Usuário não encontrado." });
        await prisma_1.prisma.user.update({ where: { id }, data: { silenciadoAte: null } });
        await (0, log_acao_1.logAcao)(moderadorId, "DESSILENCIAR_USUARIO", `Usuário ID ${id} (${alvo.nome}) dessilenciado`);
        return response.json({ message: "Usuário dessilenciado." });
    }
}
exports.UsuariosController = UsuariosController;
//# sourceMappingURL=usuarios-controller.js.map