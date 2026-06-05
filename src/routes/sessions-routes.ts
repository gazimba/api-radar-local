import { SessionsController } from "@/controllers/sessions-controller";
import { Router } from "express";

const sessionsRoutes = Router();
const sessionsController = new SessionsController();

sessionsRoutes.post("/", sessionsController.create);
sessionsRoutes.post("/google", sessionsController.google);
sessionsRoutes.post("/google/vincular", sessionsController.vincularGoogle);

export { sessionsRoutes };