import nodemailer from "nodemailer";
export declare const transporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport").SentMessageInfo, import("nodemailer/lib/smtp-transport").Options>;
export declare function enviarEmailResetSenha(email: string, nome: string, token: string): Promise<void>;
export declare function enviarEmailSugestaoAprovada(email: string, nome: string, nomeSugestao: string): Promise<void>;
export declare function enviarEmailSugestaoRejeitada(email: string, nome: string, nomeSugestao: string): Promise<void>;
export declare function enviarEmailAtivacao(email: string, nome: string, token: string): Promise<void>;
//# sourceMappingURL=mailer.d.ts.map