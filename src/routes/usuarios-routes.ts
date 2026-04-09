import { Router } from "express";
import { UsuariosController } from "@/controllers/usuarios-controller";


const usuariosRoutes = Router();
const usuariosController = new UsuariosController();

usuariosRoutes.post("/", usuariosController.create);

export { usuariosRoutes };