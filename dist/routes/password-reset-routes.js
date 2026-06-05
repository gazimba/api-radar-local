"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetRoutes = void 0;
const express_1 = require("express");
const password_reset_controller_1 = require("../controllers/password-reset-controller");
const passwordResetRoutes = (0, express_1.Router)();
exports.passwordResetRoutes = passwordResetRoutes;
const controller = new password_reset_controller_1.PasswordResetController();
passwordResetRoutes.post("/solicitar", controller.solicitar);
passwordResetRoutes.post("/redefinir", controller.redefinir);
//# sourceMappingURL=password-reset-routes.js.map