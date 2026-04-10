import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// No Prisma 7, as configurações vão DIRETAMENTE no adapter.
// O próprio Prisma vai gerenciar o pool de conexões internamente.
const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST || "localhost",
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "radar_db",
    connectionLimit: 10
});

export const prisma = new PrismaClient({
    adapter,
    log: ["query"],
});