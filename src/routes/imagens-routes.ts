import { Router } from "express";
import { ImagensController } from "@/controllers/imagens-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { authorize } from "@/middlewares/authorize";
import { upload } from "@/middlewares/upload";
import type { Request, Response, NextFunction } from "express";

const imagensRoutes = Router();
const imagensController = new ImagensController();

// Pública — listar imagens de um local/evento
imagensRoutes.get("/:tipo/:id", imagensController.listar);

// Autenticado — upload (usuário comum pode enviar junto com sugestão)
imagensRoutes.post(
    "/:tipo/:id",
    ensureAuthenticated,
    (req: Request, res: Response, next: NextFunction) => {
        upload.single("imagem")(req, res, (err) => {
            if (err) return res.status(400).json({ message: err.message });
            next();
        });
    },
    imagensController.upload
);

// ADMINISTRADOR ou MODERADOR — gerenciar imagens
imagensRoutes.patch(
    "/:tipo/:id/capa/:imagemId",
    ensureAuthenticated,
    authorize("ADMINISTRADOR", "MODERADOR"),
    imagensController.definirCapa
);

imagensRoutes.delete(
    "/:imagemId",
    ensureAuthenticated,
    authorize("ADMINISTRADOR", "MODERADOR"),
    imagensController.deletar
);

export { imagensRoutes };
