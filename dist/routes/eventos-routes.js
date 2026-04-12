import { EventosController } from "../controllers/eventos-controller";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";
import { Router } from "express";
const eventosRoutes = Router();
const eventosController = new EventosController();
//Pública
eventosRoutes.get("/", eventosController.listAll);
eventosRoutes.get("/:id", eventosController.getById);
//Privada
eventosRoutes.post("/", ensureAuthenticated, eventosController.create);
eventosRoutes.delete("/:id", ensureAuthenticated, eventosController.delete);
eventosRoutes.get("/pendentes", ensureAuthenticated, eventosController.listAllPendente);
eventosRoutes.patch("/:id/aprovar", ensureAuthenticated, eventosController.aprovar);
export { eventosRoutes };
//# sourceMappingURL=eventos-routes.js.map