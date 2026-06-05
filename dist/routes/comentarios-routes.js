"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comentariosRoutes = void 0;
const express_1 = require("express");
const comentarios_controller_1 = require("../controllers/comentarios-controller");
const ensure_authenticated_1 = require("../middlewares/ensure-authenticated");
const authorize_1 = require("../middlewares/authorize");
const comentariosRoutes = (0, express_1.Router)();
exports.comentariosRoutes = comentariosRoutes;
const controller = new comentarios_controller_1.ComentariosController();
// Listagem geral — moderador/admin
comentariosRoutes.get("/", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("MODERADOR", "ADMINISTRADOR"), controller.listAll);
// Leitura pública por local
comentariosRoutes.get("/:tipo/:id", controller.listByLocal);
// Escrita exige autenticação
comentariosRoutes.post("/:tipo/:id", ensure_authenticated_1.ensureAuthenticated, controller.create);
comentariosRoutes.post("/:id/reportar", ensure_authenticated_1.ensureAuthenticated, controller.reportar);
comentariosRoutes.delete("/:id", ensure_authenticated_1.ensureAuthenticated, controller.delete);
// Dispensar reports — moderador/admin
comentariosRoutes.delete("/:id/reports", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("MODERADOR", "ADMINISTRADOR"), controller.dispensarReport);
//# sourceMappingURL=comentarios-routes.js.map