import { Router } from "express";
import { usuariosRoutes } from "./usuarios-routes";
import { pontosTuristicosRoutes } from "./pontos-turisticos-routes";
import { eventosRoutes } from "./eventos-routes";
import { sessionsRoutes } from "./sessions-routes";
import { sugestoesRoutes } from "./sugestoes-routes";
import { ativacaoRoutes } from "./ativacao-routes";
import { cidadesRoutes } from "./cidades-routes";
import { imagensRoutes } from "./imagens-routes";
import { passwordResetRoutes } from "./password-reset-routes";
import { comentariosRoutes } from "./comentarios-routes";
import { logsRoutes } from "./logs-routes";
import { buscaRoutes } from "./busca-routes";
import { linksRoutes } from "./links-routes";
import { linksCidadeRoutes } from "./links-cidade-routes";
import { statsRoutes } from "./stats-routes";

const routes = Router();

routes.use("/api/sessions", sessionsRoutes);
routes.use("/api/usuarios", usuariosRoutes);
routes.use("/api/ativar", ativacaoRoutes);
routes.use("/api/pontos-turisticos", pontosTuristicosRoutes);
routes.use("/api/eventos", eventosRoutes);
routes.use("/api/sugestoes", sugestoesRoutes);
routes.use("/api/cidades", cidadesRoutes);
routes.use("/api/imagens", imagensRoutes);
routes.use("/api/senha", passwordResetRoutes);
routes.use("/api/comentarios", comentariosRoutes);
routes.use("/api/logs", logsRoutes);
routes.use("/api/busca", buscaRoutes);
routes.use("/api/links", linksRoutes);
routes.use("/api/links-cidade", linksCidadeRoutes);
routes.use("/api/stats", statsRoutes);

export { routes };