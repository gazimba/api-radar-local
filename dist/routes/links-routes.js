"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linksRoutes = void 0;
const express_1 = require("express");
const links_controller_1 = require("../controllers/links-controller");
const ensure_authenticated_1 = require("../middlewares/ensure-authenticated");
const authorize_1 = require("../middlewares/authorize");
const linksRoutes = (0, express_1.Router)();
exports.linksRoutes = linksRoutes;
const linksController = new links_controller_1.LinksController();
// Público — listar links de um local/evento
linksRoutes.get("/:tipo/:id", linksController.listar);
// MODERADOR/ADMIN — gerenciar links
linksRoutes.post("/:tipo/:id", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), linksController.criar);
linksRoutes.put("/:id", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), linksController.atualizar);
linksRoutes.delete("/:id", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), linksController.deletar);
//# sourceMappingURL=links-routes.js.map