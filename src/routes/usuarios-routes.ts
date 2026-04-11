import { Router } from "express";
import { UsuariosController } from "@/controllers/usuarios-controller";


const usuariosRoutes = Router();
const usuariosController = new UsuariosController();

usuariosRoutes.post("/", usuariosController.create);
usuariosRoutes.get("/", usuariosController.listAll);
usuariosRoutes.get("/:id", usuariosController.getById);
usuariosRoutes.delete("/:id", usuariosController.delete);

export { usuariosRoutes };