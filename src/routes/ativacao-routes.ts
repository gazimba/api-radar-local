import { Router } from "express";
import { AtivacaoController } from "@/controllers/ativacao-controller";

const ativacaoRoutes = Router();
const ativacaoController = new AtivacaoController();

// PÚBLICA — GET /api/ativar?token=xxx
ativacaoRoutes.get("/", ativacaoController.ativar);

export { ativacaoRoutes };
