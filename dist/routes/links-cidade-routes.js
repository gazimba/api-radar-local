"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linksCidadeRoutes = void 0;
const express_1 = require("express");
const links_cidade_controller_1 = require("../controllers/links-cidade-controller");
const ensure_authenticated_1 = require("../middlewares/ensure-authenticated");
const authorize_1 = require("../middlewares/authorize");
const linksCidadeRoutes = (0, express_1.Router)();
exports.linksCidadeRoutes = linksCidadeRoutes;
const ctrl = new links_cidade_controller_1.LinksCidadeController();
const admin = [ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR")];
// Público — listar links de uma cidade
linksCidadeRoutes.get("/:cidadeSlug", ctrl.listar);
// Admin — gerenciar
linksCidadeRoutes.post("/:cidadeSlug", ...admin, ctrl.criar);
linksCidadeRoutes.put("/:id", ...admin, ctrl.atualizar);
linksCidadeRoutes.delete("/:id", ...admin, ctrl.deletar);
linksCidadeRoutes.patch("/:cidadeSlug/reordenar", ...admin, ctrl.reordenar);
//# sourceMappingURL=links-cidade-routes.js.map