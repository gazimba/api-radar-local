"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imagensRoutes = void 0;
const express_1 = require("express");
const imagens_controller_1 = require("../controllers/imagens-controller");
const ensure_authenticated_1 = require("../middlewares/ensure-authenticated");
const authorize_1 = require("../middlewares/authorize");
const upload_1 = require("../middlewares/upload");
const imagensRoutes = (0, express_1.Router)();
exports.imagensRoutes = imagensRoutes;
const imagensController = new imagens_controller_1.ImagensController();
// Pública — listar imagens de um local/evento
imagensRoutes.get("/:tipo/:id", imagensController.listar);
// Autenticado — upload (usuário comum pode enviar junto com sugestão)
imagensRoutes.post("/:tipo/:id", ensure_authenticated_1.ensureAuthenticated, (req, res, next) => {
    upload_1.upload.single("imagem")(req, res, (err) => {
        if (err)
            return res.status(400).json({ message: err.message });
        next();
    });
}, imagensController.upload);
// ADMINISTRADOR ou MODERADOR — gerenciar imagens
imagensRoutes.patch("/:tipo/:id/capa/:imagemId", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), imagensController.definirCapa);
imagensRoutes.delete("/:imagemId", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR", "MODERADOR"), imagensController.deletar);
//# sourceMappingURL=imagens-routes.js.map