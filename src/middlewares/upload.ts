import multer from "multer";

const FORMATOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5MB

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: TAMANHO_MAXIMO },
    fileFilter(_req, file, callback) {
        if (!FORMATOS_ACEITOS.includes(file.mimetype)) {
            return callback(new Error("Formato inválido. Use JPEG, PNG ou WebP."));
        }
        callback(null, true);
    },
});
