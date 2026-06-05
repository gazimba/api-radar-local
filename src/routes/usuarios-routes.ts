import { Router } from "express";
import { UsuariosController } from "@/controllers/usuarios-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { authorize } from "@/middlewares/authorize";
import { upload } from "@/middlewares/upload";
import type { Request, Response, NextFunction } from "express";

const usuariosRoutes = Router();
const usuariosController = new UsuariosController();

// Pública
usuariosRoutes.post("/registro", usuariosController.register);

// Privada (qualquer usuário autenticado)
usuariosRoutes.patch("/alterar-senha", ensureAuthenticated, usuariosController.alterarSenha);
usuariosRoutes.patch("/perfil", ensureAuthenticated, usuariosController.atualizarPerfil);
usuariosRoutes.post("/foto", ensureAuthenticated, (req: Request, res: Response, next: NextFunction) => {
    upload.single("foto")(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
}, usuariosController.uploadFoto);

//Privada (somente ADMINISTRADOR)
usuariosRoutes.post("/", ensureAuthenticated, authorize("ADMINISTRADOR"), usuariosController.create);
usuariosRoutes.get("/", ensureAuthenticated, authorize("ADMINISTRADOR"), usuariosController.listAll);
usuariosRoutes.get("/:id", ensureAuthenticated, authorize("ADMINISTRADOR"), usuariosController.getById);
usuariosRoutes.delete("/:id", ensureAuthenticated, authorize("ADMINISTRADOR"), usuariosController.delete);
usuariosRoutes.patch("/:id/cargo", ensureAuthenticated, authorize("ADMINISTRADOR"), usuariosController.alterarCargo);
usuariosRoutes.patch("/:id/ativo", ensureAuthenticated, authorize("ADMINISTRADOR"), usuariosController.alterarAtivo);

// Silenciar/dessilenciar — moderador ou admin
usuariosRoutes.patch("/:id/silenciar", ensureAuthenticated, authorize("MODERADOR", "ADMINISTRADOR"), usuariosController.silenciar);
usuariosRoutes.patch("/:id/dessilenciar", ensureAuthenticated, authorize("MODERADOR", "ADMINISTRADOR"), usuariosController.dessilenciar);

export { usuariosRoutes };