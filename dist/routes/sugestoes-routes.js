"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sugestoesRoutes = void 0;
const express_1 = require("express");
const ensure_authenticated_1 = require("../middlewares/ensure-authenticated");
const authorize_1 = require("../middlewares/authorize");
const sugestoes_controller_1 = require("../controllers/sugestoes-controller");
const sugestoesRoutes = (0, express_1.Router)();
exports.sugestoesRoutes = sugestoesRoutes;
const sugestoesController = new sugestoes_controller_1.SugestoesController();
// PRIVADA (usuário autenticado)
sugestoesRoutes.post("/", ensure_authenticated_1.ensureAuthenticated, sugestoesController.create);
// PRIVADA (ADMINISTRADOR ou MODERADOR)
sugestoesRoutes.get("/", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), sugestoesController.listAll);
sugestoesRoutes.patch("/:tipo/:id/rejeitar", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), sugestoesController.rejeitar);
//# sourceMappingURL=sugestoes-routes.js.map