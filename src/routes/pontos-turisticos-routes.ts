import { Router } from "express";
import { PontosTuristicosController } from "@/controllers/pontos-turisticos-controller";

const pontosTuristicosRoutes = Router();
const pontosTuristicosController = new PontosTuristicosController();

pontosTuristicosRoutes.post("/", pontosTuristicosController.create);

export { pontosTuristicosRoutes };