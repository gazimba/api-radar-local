"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuariosRoutes = void 0;
const express_1 = require("express");
const usuarios_controller_1 = require("../controllers/usuarios-controller");
const ensure_authenticated_1 = require("../middlewares/ensure-authenticated");
const authorize_1 = require("../middlewares/authorize");
const upload_1 = require("../middlewares/upload");
const usuariosRoutes = (0, express_1.Router)();
exports.usuariosRoutes = usuariosRoutes;
const usuariosController = new usuarios_controller_1.UsuariosController();
// Pública
usuariosRoutes.post("/registro", usuariosController.register);
// Privada (qualquer usuário autenticado)
usuariosRoutes.patch("/alterar-senha", ensure_authenticated_1.ensureAuthenticated, usuariosController.alterarSenha);
usuariosRoutes.patch("/perfil", ensure_authenticated_1.ensureAuthenticated, usuariosController.atualizarPerfil);
usuariosRoutes.post("/foto", ensure_authenticated_1.ensureAuthenticated, (req, res, next) => {
    upload_1.upload.single("foto")(req, res, (err) => {
        if (err)
            return res.status(400).json({ message: err.message });
        next();
    });
}, usuariosController.uploadFoto);
//Privada (somente ADMINISTRADOR)
usuariosRoutes.post("/", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR"), usuariosController.create);
usuariosRoutes.get("/", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR"), usuariosController.listAll);
usuariosRoutes.get("/:id", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR"), usuariosController.getById);
usuariosRoutes.delete("/:id", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR"), usuariosController.delete);
usuariosRoutes.patch("/:id/cargo", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR"), usuariosController.alterarCargo);
usuariosRoutes.patch("/:id/ativo", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("ADMINISTRADOR"), usuariosController.alterarAtivo);
// Silenciar/dessilenciar — moderador ou admin
usuariosRoutes.patch("/:id/silenciar", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("MODERADOR", "ADMINISTRADOR"), usuariosController.silenciar);
usuariosRoutes.patch("/:id/dessilenciar", ensure_authenticated_1.ensureAuthenticated, (0, authorize_1.authorize)("MODERADOR", "ADMINISTRADOR"), usuariosController.dessilenciar);
//# sourceMappingURL=usuarios-routes.js.map