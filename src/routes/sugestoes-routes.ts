import { Router } from "express";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { authorize } from "@/middlewares/authorize";
import { SugestoesController } from "@/controllers/sugestoes-controller";

const sugestoesRoutes = Router();
const sugestoesController = new SugestoesController();

// PRIVADA (usuário autenticado)
sugestoesRoutes.post("/", ensureAuthenticated, sugestoesController.create);

// PRIVADA (ADMINISTRADOR ou MODERADOR)
sugestoesRoutes.get("/", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), sugestoesController.listAll);
sugestoesRoutes.patch("/:tipo/:id/rejeitar", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), sugestoesController.rejeitar);

export { sugestoesRoutes };