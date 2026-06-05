"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pontosTuristicosRoutes = void 0;
const express_1 = require("express");
const pontos_turisticos_controller_1 = require("../controllers/pontos-turisticos-controller");
const ensure_authenticated_1 = require("../middlewares/ensure-authenticated");
const authorize_1 = require("../middlewares/authorize");
const pontosTuristicosRoutes = (0, express_1.Router)();
exports.pontosTuristicosRoutes = pontosTuristicosRoutes;
const pontosTuristicosController = new pontos_turisticos_controller_1.PontosTuristicosController();
//Pública
pontosTuristicosRoutes.get("/", pontosTuristicosController.listAll);
pontosTuristicosRoutes.get("/:id", pontosTuristicosController.getById);
// Admin — lista completa (todos status e ativo)
pontosTuristicosRoutes.get("/admin/todos", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), pontosTuristicosController.listAllAdmin);
// ADMINISTRADOR ou MODERADOR
pontosTuristicosRoutes.post("/", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), pontosTuristicosController.create);
// Somente ADMINISTRADOR
pontosTuristicosRoutes.delete("/:id", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR"), pontosTuristicosController.delete);
// ADMINISTRADOR ou MODERADOR
pontosTuristicosRoutes.get("/pendentes", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), pontosTuristicosController.listAllPendente);
pontosTuristicosRoutes.patch("/:id/aprovar", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), pontosTuristicosController.aprovar);
pontosTuristicosRoutes.put("/:id", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), pontosTuristicosController.update);
pontosTuristicosRoutes.patch("/:id/desativar", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), pontosTuristicosController.desativar);
pontosTuristicosRoutes.patch("/:id/reativar", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), pontosTuristicosController.reativar);
//# sourceMappingURL=pontos-turisticos-routes.js.map