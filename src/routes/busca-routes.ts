import { Router } from "express";
import { BuscaController } from "@/controllers/busca-controller";

const buscaRoutes = Router();
const buscaController = new BuscaController();

buscaRoutes.get("/", buscaController.buscar);

export { buscaRoutes };
