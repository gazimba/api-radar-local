import { Router } from "express";
import { EventosController } from "@/controllers/eventos-controller";

const eventosRoutes = Router();
const eventosController = new EventosController();

eventosRoutes.post("/", eventosController.create);

export { eventosRoutes };