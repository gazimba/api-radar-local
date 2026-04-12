import express from 'express'
import cors from 'cors'
import { routes } from './routes';

const app = express()

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

app.use(express.json())

app.use(routes)

export { app }