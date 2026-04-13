import { Router } from "express";
import { UsuariosController } from "@/controllers/usuarios-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";

const usuariosRoutes = Router();
const usuariosController = new UsuariosController();

//Pública

//Privada
usuariosRoutes.post("/", ensureAuthenticated, usuariosController.create);
usuariosRoutes.get("/", ensureAuthenticated, usuariosController.listAll);
usuariosRoutes.get("/:id", ensureAuthenticated, usuariosController.getById);
usuariosRoutes.delete("/:id", ensureAuthenticated, usuariosController.delete);

export { usuariosRoutes };