"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const FORMATOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5MB
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: TAMANHO_MAXIMO },
    fileFilter(_req, file, callback) {
        if (!FORMATOS_ACEITOS.includes(file.mimetype)) {
            return callback(new Error("Formato inválido. Use JPEG, PNG ou WebP."));
        }
        callback(null, true);
    },
});
//# sourceMappingURL=upload.js.map