"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cidadesRoutes = void 0;
const express_1 = require("express");
const cidades_controller_1 = require("../controllers/cidades-controller");
const ensure_authenticated_1 = require("../middlewares/ensure-authenticated");
const authorize_1 = require("../middlewares/authorize");
const cidadesRoutes = (0, express_1.Router)();
exports.cidadesRoutes = cidadesRoutes;
const cidadesController = new cidades_controller_1.CidadesController();
// Pública
cidadesRoutes.get("/", cidadesController.listAtivas);
// Privada (somente ADMINISTRADOR)
cidadesRoutes.get("/todas", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR"), cidadesController.listAll);
cidadesRoutes.post("/", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR"), cidadesController.create);
cidadesRoutes.patch("/:id/toggle", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR"), cidadesController.toggleAtiva);
cidadesRoutes.delete("/:id", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR"), cidadesController.delete);
//# sourceMappingURL=cidades-routes.js.map