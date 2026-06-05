import { Router } from "express";
import { LinksCidadeController } from "@/controllers/links-cidade-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { authorize } from "@/middlewares/authorize";

const linksCidadeRoutes = Router();
const ctrl = new LinksCidadeController();

const admin = [ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR")];

// Público — listar links de uma cidade
linksCidadeRoutes.get("/:cidadeSlug", ctrl.listar);

// Admin — gerenciar
linksCidadeRoutes.post("/:cidadeSlug", ...admin, ctrl.criar);
linksCidadeRoutes.put("/:id", ...admin, ctrl.atualizar);
linksCidadeRoutes.delete("/:id", ...admin, ctrl.deletar);
linksCidadeRoutes.patch("/:cidadeSlug/reordenar", ...admin, ctrl.reordenar);

export { linksCidadeRoutes };
