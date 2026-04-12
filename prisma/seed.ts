import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
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