import { EventosController } from "@/controllers/eventos-controller";
import { Router } from "express";

const eventosRoutes = Router();
const eventosController = new EventosController();

eventosRoutes.post("/", eventosController.create);

export { eventosRoutes };