import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { routes } from './routes';

const app = express()

app.set("trust proxy", 1)

app.use(helmet({
    contentSecurityPolicy: false, // CSP gerenciado pelo frontend
    crossOriginEmbedderPolicy: false,
}))

const allowedOrigins = [
    'http://localhost:5173', 
    'https://radar-local-beta.vercel.app' 
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Acesso não permitido pela política de CORS'))
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Authorization"],
    credentials: true
}));

const limiterGeral = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 200 : 2000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Muitas requisições. Tente novamente em alguns minutos." },
});

const limiterAuth = rateLimit({
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(routes)

export { app }