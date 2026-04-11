import { EventosController } from "@/controllers/eventos-controller";
import { Router } from "express";

const eventosRoutes = Router();
const eventosController = new EventosController();

eventosRoutes.post("/", eventosController.create);
eventosRoutes.get("/", eventosController.listAll);
eventosRoutes.get("/:id", eventosController.getById);
eventosRoutes.delete("/:id", eventosController.delete);

export { eventosRoutes };