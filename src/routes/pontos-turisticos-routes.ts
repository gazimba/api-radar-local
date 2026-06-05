import { Router } from "express";
import { PontosTuristicosController } from "@/controllers/pontos-turisticos-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { authorize } from "@/middlewares/authorize";

const pontosTuristicosRoutes = Router();
const pontosTuristicosController = new PontosTuristicosController();
//Pública
pontosTuristicosRoutes.get("/", pontosTuristicosController.listAll);
pontosTuristicosRoutes.get("/:id", pontosTuristicosController.getById);
// Admin — lista completa (todos status e ativo)
pontosTuristicosRoutes.get("/admin/todos", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), pontosTuristicosController.listAllAdmin);
// ADMINISTRADOR ou MODERADOR
pontosTuristicosRoutes.post("/", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), pontosTuristicosController.create);
// Somente ADMINISTRADOR
pontosTuristicosRoutes.delete("/:id", ensureAuthenticated, authorize("ADMINISTRADOR"), pontosTuristicosController.delete);
// ADMINISTRADOR ou MODERADOR
pontosTuristicosRoutes.get("/pendentes", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), pontosTuristicosController.listAllPendente);
pontosTuristicosRoutes.patch("/:id/aprovar", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), pontosTuristicosController.aprovar);
pontosTuristicosRoutes.put("/:id", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), pontosTuristicosController.update);
pontosTuristicosRoutes.patch("/:id/desativar", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), pontosTuristicosController.desativar);
pontosTuristicosRoutes.patch("/:id/reativar", ensureAuthenticated, authorize("ADMINISTRADOR", "MODERADOR"), pontosTuristicosController.reativar);

export { pontosTuristicosRoutes };