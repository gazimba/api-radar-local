"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
exports.enviarEmailResetSenha = enviarEmailResetSenha;
exports.enviarEmailSugestaoAprovada = enviarEmailSugestaoAprovada;
exports.enviarEmailSugestaoRejeitada = enviarEmailSugestaoRejeitada;
exports.enviarEmailAtivacao = enviarEmailAtivacao;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.transporter = nodemailer_1.default.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});
async function enviarEmailResetSenha(email, nome, token) {
    const url = `${process.env.FRONTEND_URL}redefinir-senha?token=${token}`;
    await exports.transporter.sendMail({
        from: '"Radar Local" <noreply@radar-local.com>',
        to: email,
        subject: "Redefinição de senha — Radar Local",
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #1e40af;">Olá, ${nome}!</h2>
                <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo:</p>
                <a href="${url}" style="display:inline-block; margin: 16px 0; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Redefinir minha senha
                </a>
                <p style="color: #6b7280; font-size: 13px;">Este link expira em <strong>1 hora</strong>.</p>
                <p style="color: #6b7280; font-size: 13px;">Se você não solicitou a redefinição, ignore este email.</p>
                <p style="color: #6b7280; font-size: 13px;">Ou copie e cole este link no navegador:<br/>${url}</p>
            </div>
        `,
    });
}
async function enviarEmailSugestaoAprovada(email, nome, nomeSugestao) {
    await exports.transporter.sendMail({
        from: '"Radar Local" <noreply@radar-local.com>',
        to: email,
        subject: "Sua sugestão foi aprovada! — Radar Local",
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #1e40af;">Parabéns, ${nome}!</h2>
                <p>Sua sugestão <strong>"${nomeSugestao}"</strong> foi <span style="color: #16a34a; font-weight: bold;">aprovada</span> e já está disponível no Radar Local.</p>
                <p>Obrigado pela contribuição com a comunidade!</p>
                <a href="${process.env.FRONTEND_URL}" style="display:inline-block; margin: 16px 0; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Ver no Radar Local
                </a>
            </div>
        `,
    });
}
async function enviarEmailSugestaoRejeitada(email, nome, nomeSugestao) {
    await exports.transporter.sendMail({
        from: '"Radar Local" <noreply@radar-local.com>',
        to: email,
        subject: "Atualização sobre sua sugestão — Radar Local",
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #1e40af;">Olá, ${nome}!</h2>
                <p>Infelizmente, sua sugestão <strong>"${nomeSugestao}"</strong> não pôde ser <span style="color: #dc2626; font-weight: bold;">aprovada</span> desta vez.</p>
                <p>Mas não desanime! Você pode enviar novas sugestões a qualquer momento.</p>
                <a href="${process.env.FRONTEND_URL}sugestao" style="display:inline-block; margin: 16px 0; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Enviar nova sugestão
                </a>
            </div>
        `,
    });
}
async function enviarEmailAtivacao(email, nome, token) {
    const url = `${process.env.FRONTEND_URL}ativar?token=${token}`;
    await exports.transporter.sendMail({
        from: '"Radar Local" <noreply@radar-local.com>',
        to: email,
        subject: "Ative sua conta no Radar Local",
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #1e40af;">Bem-vindo ao Radar Local, ${nome}!</h2>
                <p>Sua conta foi criada com sucesso. Clique no botão abaixo para ativá-la:</p>
                <a href="${url}" style="display:inline-block; margin: 16px 0; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Ativar minha conta
                </a>
                <p style="color: #6b7280; font-size: 13px;">Se você não criou essa conta, ignore este email.</p>
                <p style="color: #6b7280; font-size: 13px;">Ou copie e cole este link no navegador:<br/>${url}</p>
            </div>
        `,
    });
}
//# sourceMappingURL=mailer.js.map