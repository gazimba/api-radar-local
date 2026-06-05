"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsController = void 0;
const prisma_1 = require("../database/prisma");
const zod_1 = require("zod");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const auth_1 = __importDefault(require("../config/auth"));
const { sign } = jsonwebtoken_1.default;
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
function gerarToken(userId) {
    return sign({}, auth_1.default.jwt.secret, {
        subject: String(userId),
        expiresIn: auth_1.default.jwt.expiresIn,
    });
}
class SessionsController {
    async create(request, response) {
        const sessionSchema = zod_1.z.object({
            email: zod_1.z.email(),
            senha: zod_1.z.string(),
        });
        const { email, senha } = sessionSchema.parse(request.body);
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.senha) {
            return response.status(401).json({ message: "E-mail e/ou senha incorretos" });
        }
        const passwordMatched = await (0, bcrypt_1.compare)(senha, user.senha);
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
    async google(request, response) {
        const { credential } = zod_1.z.object({ credential: zod_1.z.string() }).parse(request.body);
        // Validar token com a API do Google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        });
        const payload = ticket.getPayload();
        if (!payload?.email) {
            return response.status(400).json({ message: "Token do Google inválido." });
        }
        const { email, name, picture, sub: googleId } = payload;
        // Verificar se já existe conta com esse googleId
        const userPorGoogleId = await prisma_1.prisma.user.findUnique({ where: { googleId } });
        if (userPorGoogleId) {
            const token = gerarToken(userPorGoogleId.id);
            const { senha: _, ...userData } = userPorGoogleId;
            return response.json({ user: userData, token });
        }
        // Verificar se existe conta com esse email
        const userPorEmail = await prisma_1.prisma.user.findUnique({ where: { email } });
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
        const novoUser = await prisma_1.prisma.user.create({
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
    async vincularGoogle(request, response) {
        const schema = zod_1.z.object({
            email: zod_1.z.email(),
            senha: zod_1.z.string(),
            googleId: zod_1.z.string(),
            foto: zod_1.z.string().optional(),
        });
        const { email, senha, googleId, foto } = schema.parse(request.body);
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.senha) {
            return response.status(401).json({ message: "E-mail e/ou senha incorretos" });
        }
        const passwordMatched = await (0, bcrypt_1.compare)(senha, user.senha);
        if (!passwordMatched) {
            return response.status(401).json({ message: "Senha incorreta." });
        }
        if (!user.ativo) {
            return response.status(403).json({ message: "Conta não ativada. Verifique seu e-mail." });
        }
        const atualizado = await prisma_1.prisma.user.update({
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
exports.SessionsController = SessionsController;
//# sourceMappingURL=sessions-controller.js.map