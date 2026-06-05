"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const secret = process.env.AUTH_SECRET;
if (!secret)
    throw new Error("AUTH_SECRET não definido nas variáveis de ambiente");
exports.default = {
    jwt: {
        secret,
        expiresIn: "1d",
    },
};
//# sourceMappingURL=auth.js.map