import type { StringValue } from "ms";

const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error("AUTH_SECRET não definido nas variáveis de ambiente");

export default {
    jwt: {
        secret,
        expiresIn: "1d" as StringValue,
    },
};