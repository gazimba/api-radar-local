import { EventosController } from "@/controllers/eventos-controller";
import { Router } from "express";

const eventosRoutes = Router();
const eventosController = new EventosController();
//Pública
eventosRoutes.get("/", eventosController.listAll);
eventosRoutes.get("/:id", eventosController.getById);
//Privada
eventosRoutes.post("/", eventosController.create);
eventosRoutes.delete("/:id", eventosController.delete);

export { eventosRoutes };