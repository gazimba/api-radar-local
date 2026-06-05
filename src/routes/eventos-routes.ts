import { EventosController } from "@/controllers/eventos-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { authorize } from "@/middlewares/authorize";
import { Router } from "express";

const eventosRoutes = Router();
const eventosController = new EventosController();
//Pública
eventosRoutes.get("/", eventosController.listAll);
eventosRoutes.get("/:id", eventosController.getById);
// Admin — lista completa
eventosRoutes.get("/admin/todos", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), eventosController.listAllAdmin);
// ADMINISTRADOR ou MODERADOR
eventosRoutes.post("/", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), eventosController.create);
// Somente ADMINISTRADOR
eventosRoutes.delete("/:id", ensureAuthenticated, authorize("ADMINISTRADOR"), eventosController.delete);
// ADMINISTRADOR ou MODERADOR
eventosRoutes.get("/pendentes", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), eventosController.listAllPendente);
eventosRoutes.patch("/:id/aprovar", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), eventosController.aprovar);
eventosRoutes.put("/:id", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), eventosController.update);
eventosRoutes.patch("/:id/desativar", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), eventosController.desativar);
eventosRoutes.patch("/:id/reativar", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), eventosController.reativar);

export { eventosRoutes };