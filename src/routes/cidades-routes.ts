import { Router } from "express";
import { CidadesController } from "@/controllers/cidades-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { authorize } from "@/middlewares/authorize";

const cidadesRoutes = Router();
const cidadesController = new CidadesController();

// Pública
cidadesRoutes.get("/", cidadesController.listAtivas);

// Privada (somente ADMINISTRADOR)
cidadesRoutes.get("/todas", ensureAuthenticated, authorize("ADMINISTRADOR"), cidadesController.listAll);
cidadesRoutes.post("/", ensureAuthenticated, authorize("ADMINISTRADOR"), cidadesController.create);
cidadesRoutes.patch("/:id/toggle", ensureAuthenticated, authorize("ADMINISTRADOR"), cidadesController.toggleAtiva);
cidadesRoutes.delete("/:id", ensureAuthenticated, authorize("ADMINISTRADOR"), cidadesController.delete);

export { cidadesRoutes };
