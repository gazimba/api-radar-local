import type { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { cloudinary } from "@/config/cloudinary";

const LIMITE_IMAGENS = 5;

class ImagensController {
    async upload(request: Request, response: Response) {
        const { tipo, id } = request.params; // tipo: "ponto-turistico" | "evento"

        if (!request.file) {
            return response.status(400).json({ message: "Nenhuma imagem enviada." });
        }

        const isPonto = tipo === "ponto-turistico";
        const idNum = Number(id);

        // Verificar se o registro existe
        const registro = isPonto
            ? await prisma.pontoTuristico.findUnique({ where: { id: idNum } })
            : await prisma.evento.findUnique({ where: { id: idNum } });

        if (!registro) {
            return response.status(404).json({ message: `${isPonto ? "Ponto turístico" : "Evento"} não encontrado.` });
        }

        // Verificar limite de 5 imagens
        const totalImagens = await prisma.imagem.count({
            where: isPonto ? { pontoTuristicoId: idNum } : { eventoId: idNum },
        });

        if (totalImagens >= LIMITE_IMAGENS) {
            return response.status(400).json({ message: `Limite de ${LIMITE_IMAGENS} imagens atingido.` });
        }

        // Upload para o Cloudinary
        const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: `radar-local/${tipo}s`, resource_type: "image" },
                (error, result) => {
                    if (error || !result) return reject(error);
                    resolve({ secure_url: result.secure_url, public_id: result.public_id });
                }
            );
            stream.end(request.file!.buffer);
        });

        // Primeira imagem vira capa automaticamente
        const ehCapa = totalImagens === 0;

        const imagem = await prisma.imagem.create({
            data: {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                capa: ehCapa,
                ...(isPonto ? { pontoTuristicoId: idNum } : { eventoId: idNum }),
            },
        });

        return response.status(201).json(imagem);
    }

    async listar(request: Request, response: Response) {
        const { tipo, id } = request.params;
        const isPonto = tipo === "ponto-turistico";
        const idNum = Number(id);

        const imagens = await prisma.imagem.findMany({
            where: isPonto ? { pontoTuristicoId: idNum } : { eventoId: idNum },
            orderBy: [{ capa: "desc" }, { createdAt: "asc" }],
        });

        return response.json(imagens);
    }

    async definirCapa(request: Request, response: Response) {
        const { tipo, id, imagemId } = request.params;
        const isPonto = tipo === "ponto-turistico";
        const idNum = Number(id);

        // Remove capa das outras imagens
        await prisma.imagem.updateMany({
            where: isPonto ? { pontoTuristicoId: idNum } : { eventoId: idNum },
            data: { capa: false },
        });

        // Define a nova capa
        const imagem = await prisma.imagem.update({
            where: { id: Number(imagemId) },
            data: { capa: true },
        });

        return response.json({ message: "Capa definida com sucesso.", imagem });
    }

    async deletar(request: Request, response: Response) {
        const { imagemId } = request.params;

        const imagem = await prisma.imagem.findUnique({ where: { id: Number(imagemId) } });

        if (!imagem) {
            return response.status(404).json({ message: "Imagem não encontrada." });
        }

        // Deletar do Cloudinary
        await cloudinary.uploader.destroy(imagem.publicId);

        // Deletar do banco
        await prisma.imagem.delete({ where: { id: Number(imagemId) } });

        // Se era a capa, define a próxima como capa
        if (imagem.capa) {
            const proxima = await prisma.imagem.findFirst({
                where: imagem.pontoTuristicoId
                    ? { pontoTuristicoId: imagem.pontoTuristicoId }
                    : { eventoId: imagem.eventoId! },
                orderBy: { createdAt: "asc" },
            });
            if (proxima) {
                await prisma.imagem.update({ where: { id: proxima.id }, data: { capa: true } });
            }
        }

        return response.json({ message: "Imagem removida com sucesso." });
    }
}

export { ImagensController };
