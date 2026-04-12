import { Router } from "express";
import { usuariosRoutes } from "./usuarios-routes";
import { pontosTuristicosRoutes } from "./pontos-turisticos-routes";
import { eventosRoutes } from "./eventos-routes";
import { sessionsRoutes } from "./sessions-routes";
import { sugestoesRoutes } from "./sugestoes-routes";

const routes = Router();

routes.use("/api/sessions", sessionsRoutes);
routes.use("/api/usuarios", usuariosRoutes);
routes.use("/api/pontos-turisticos", pontosTuristicosRoutes);
routes.use("/api/eventos", eventosRoutes);
routes.use("/api/sugestoes", sugestoesRoutes);

export { routes };