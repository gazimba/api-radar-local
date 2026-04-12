import { Router } from "express";
import { PontosTuristicosController } from "../controllers/pontos-turisticos-controller";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";
const pontosTuristicosRoutes = Router();
const pontosTuristicosController = new PontosTuristicosController();
//Pública
pontosTuristicosRoutes.get("/", pontosTuristicosController.listAll);
pontosTuristicosRoutes.get("/:id", pontosTuristicosController.getById);
//Privada
pontosTuristicosRoutes.post("/", ensureAuthenticated, pontosTuristicosController.create);
pontosTuristicosRoutes.delete("/:id", ensureAuthenticated, pontosTuristicosController.delete);
pontosTuristicosRoutes.get("/pendentes", ensureAuthenticated, pontosTuristicosController.listAllPendente);
pontosTuristicosRoutes.patch("/:id/aprovar", ensureAuthenticated, pontosTuristicosController.aprovar);
export { pontosTuristicosRoutes };
//# sourceMappingURL=pontos-turisticos-routes.js.map