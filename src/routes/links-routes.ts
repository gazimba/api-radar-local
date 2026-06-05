import { Router } from "express";
import { LinksController } from "@/controllers/links-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { authorize } from "@/middlewares/authorize";

const linksRoutes = Router();
const linksController = new LinksController();

// Público — listar links de um local/evento
linksRoutes.get("/:tipo/:id", linksController.listar);

// MODERADOR/ADMIN — gerenciar links
linksRoutes.post(
    "/:tipo/:id",
    ensureAuthenticated,
    authorize("ADMINISTRADOR", "MODERADOR"),
    linksController.criar
);

linksRoutes.put(
    "/:id",
    ensureAuthenticated,
    authorize("ADMINISTRADOR", "MODERADOR"),
    linksController.atualizar
);

linksRoutes.delete(
    "/:id",
    ensureAuthenticated,
    authorize("ADMINISTRADOR", "MODERADOR"),
    linksController.deletar
);

export { linksRoutes };
