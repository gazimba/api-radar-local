import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
// 👇 Importação adicionada aqui!
import { hash } from "bcrypt";

// 1. Criamos a conexão usando a variável de ambiente
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// 2. Passamos para o adaptador do Postgres
const adapter = new PrismaPg(pool);

// 3. Inicializamos o cliente do Prisma 7 corretamente
const prisma = new PrismaClient({ adapter });

async function main() {
    // Agora o JavaScript sabe de onde vem o "hash"
    const passwordHash = await hash("admin123", 8);

    await prisma.user.upsert({
        where: { email: "admin@email.com" },
        update: {},
        create: {
            nome: "Administrador",
            email: "admin@email.com",
            senha: passwordHash,
        },
    });

    console.log("✅ Seed executado: Usuário padrão (admin@email.com) criado.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("Erro no seed:", e);
        await prisma.$disconnect();
        process.exit(1);
    });