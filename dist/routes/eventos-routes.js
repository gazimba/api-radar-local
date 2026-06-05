"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventosRoutes = void 0;
const eventos_controller_1 = require("../controllers/eventos-controller");
const ensure_authenticated_1 = require("../middlewares/ensure-authenticated");
const authorize_1 = require("../middlewares/authorize");
const express_1 = require("express");
const eventosRoutes = (0, express_1.Router)();
exports.eventosRoutes = eventosRoutes;
const eventosController = new eventos_controller_1.EventosController();
//Pública
eventosRoutes.get("/", eventosController.listAll);
eventosRoutes.get("/:id", eventosController.getById);
// Admin — lista completa
eventosRoutes.get("/admin/todos", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), eventosController.listAllAdmin);
// ADMINISTRADOR ou MODERADOR
eventosRoutes.post("/", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), eventosController.create);
// Somente ADMINISTRADOR
eventosRoutes.delete("/:id", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR"), eventosController.delete);
// ADMINISTRADOR ou MODERADOR
eventosRoutes.get("/pendentes", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), eventosController.listAllPendente);
eventosRoutes.patch("/:id/aprovar", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), eventosController.aprovar);
eventosRoutes.put("/:id", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), eventosController.update);
eventosRoutes.patch("/:id/desativar", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), eventosController.desativar);
eventosRoutes.patch("/:id/reativar", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), eventosController.reativar);
//# sourceMappingURL=eventos-routes.js.map