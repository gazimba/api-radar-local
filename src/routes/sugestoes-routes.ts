import { Router } from "express";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { SugestoesController } from "@/controllers/sugestoes-controller";

const sugestoesRoutes = Router();
const sugestoesController = new SugestoesController();

// PÚBLICA
sugestoesRoutes.post("/", sugestoesController.create);

// PRIVADA
sugestoesRoutes.get("/", ensureAuthenticated, sugestoesController.listAll);

export { sugestoesRoutes };