"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ativacaoRoutes = void 0;
const express_1 = require("express");
const ativacao_controller_1 = require("../controllers/ativacao-controller");
const ativacaoRoutes = (0, express_1.Router)();
exports.ativacaoRoutes = ativacaoRoutes;
const ativacaoController = new ativacao_controller_1.AtivacaoController();
// PÚBLICA — GET /api/ativar?token=xxx
ativacaoRoutes.get("/", ativacaoController.ativar);
//# sourceMappingURL=ativacao-routes.js.map