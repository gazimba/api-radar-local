import { Router } from "express";
import { PontosTuristicosController } from "@/controllers/pontos-turisticos-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";

const pontosTuristicosRoutes = Router();
const pontosTuristicosController = new PontosTuristicosController();
//Pública
pontosTuristicosRoutes.get("/", pontosTuristicosController.listAll);
pontosTuristicosRoutes.get("/:id", pontosTuristicosController.getById);
//Privada
pontosTuristicosRoutes.post("/", ensureAuthenticated, pontosTuristicosController.create);
pontosTuristicosRoutes.delete("/:id", ensureAuthenticated, pontosTuristicosController.delete);

export { pontosTuristicosRoutes };