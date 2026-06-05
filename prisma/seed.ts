import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
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
    const passwordHash = await hash("admin123", 8);

    await prisma.user.upsert({
        where: { email: "admin@email.com" },
        update: {
            ativo: true,
            cargo: "ADMINISTRADOR",
        },
        create: {
            nome: "Administrador",
            email: "admin@email.com",
            senha: passwordHash,
            cargo: "ADMINISTRADOR",
            ativo: true,
        },
    });

    // Criar cidade padrão: Congonhas - MG
    const congonhas = await prisma.cidade.upsert({
        where: { slug: "congonhas-mg" },
        update: { ativa: true },
        create: {
            nome: "Congonhas",
            estado: "MG",
            slug: "congonhas-mg",
            ativa: true,
        },
    });

    // Vincular pontos turísticos e eventos existentes sem cidade à Congonhas
    await prisma.pontoTuristico.updateMany({
        where: { cidadeId: 0 },
        data: { cidadeId: congonhas.id },
    });

    await prisma.evento.updateMany({
        where: { cidadeId: 0 },
        data: { cidadeId: congonhas.id },
    });

    console.log("✅ Seed executado: Admin criado e Congonhas-MG cadastrada.");
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