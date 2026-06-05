"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscaRoutes = void 0;
const express_1 = require("express");
const busca_controller_1 = require("../controllers/busca-controller");
const buscaRoutes = (0, express_1.Router)();
exports.buscaRoutes = buscaRoutes;
const buscaController = new busca_controller_1.BuscaController();
buscaRoutes.get("/", buscaController.buscar);
//# sourceMappingURL=busca-routes.js.map