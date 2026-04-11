import { Router } from "express";
import { PontosTuristicosController } from "@/controllers/pontos-turisticos-controller";

const pontosTuristicosRoutes = Router();
const pontosTuristicosController = new PontosTuristicosController();

pontosTuristicosRoutes.post("/", pontosTuristicosController.create);
pontosTuristicosRoutes.get("/", pontosTuristicosController.listAll);
pontosTuristicosRoutes.get("/:id", pontosTuristicosController.getById);
pontosTuristicosRoutes.delete("/:id", pontosTuristicosController.delete);

export { pontosTuristicosRoutes };