import { prisma } from "@/database/prisma";

export async function logAcao(userId: number, acao: string, detalhes?: string) {
    try {
        await prisma.logAcao.create({ data: { userId, acao, detalhes: detalhes ?? null } });
    } catch {
        // log não deve quebrar a operação principal
    }
}
