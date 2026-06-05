import { Router } from "express";
import { ComentariosController } from "@/controllers/comentarios-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { authorize } from "@/middlewares/authorize";

const comentariosRoutes = Router();
const controller = new ComentariosController();

// Listagem geral — moderador/admin
comentariosRoutes.get("/", ensureAuthenticated, authorize("MODERADOR", "ADMINISTRADOR"), controller.listAll);

// Leitura pública por local
comentariosRoutes.get("/:tipo/:id", controller.listByLocal);

// Escrita exige autenticação
comentariosRoutes.post("/:tipo/:id", ensureAuthenticated, controller.create);
comentariosRoutes.post("/:id/reportar", ensureAuthenticated, controller.reportar);
comentariosRoutes.delete("/:id", ensureAuthenticated, controller.delete);

// Dispensar reports — moderador/admin
comentariosRoutes.delete("/:id/reports", ensureAuthenticated, authorize("MODERADOR", "ADMINISTRADOR"), controller.dispensarReport);

export { comentariosRoutes };
