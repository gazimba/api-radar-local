"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const routes_1 = require("./routes");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, helmet_1.default)());
const allowedOrigins = [
    'http://localhost:5173',
    'https://radar-local-beta.vercel.app'
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Acesso não permitido pela política de CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Authorization"],
    credentials: true
}));
const limiterGeral = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Muitas requisições. Tente novamente em alguns minutos." },
});
const limiterAuth = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Muitas tentativas de login. Tente novamente em 15 minutos." },
});
app.use(limiterGeral);
app.use("/api/sessions", limiterAuth);
app.use("/api/senha", limiterAuth);
app.use("/api/usuarios/registro", limiterAuth);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
app.use(routes_1.routes);
//# sourceMappingURL=app.js.map