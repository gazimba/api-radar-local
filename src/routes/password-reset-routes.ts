import { Router } from "express";
import { PasswordResetController } from "@/controllers/password-reset-controller";

const passwordResetRoutes = Router();
const controller = new PasswordResetController();

passwordResetRoutes.post("/solicitar", controller.solicitar);
passwordResetRoutes.post("/redefinir", controller.redefinir);

export { passwordResetRoutes };
