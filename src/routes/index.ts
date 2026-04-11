import { Router } from "express"
import { usuariosRoutes } from "./usuarios-routes"
import { pontosTuristicosRoutes } from "./pontos-turisticos-routes"
import { eventosRoutes } from "./eventos-routes"

const routes = Router()
//public
routes.use("/api/usuarios", usuariosRoutes)
routes.use("/api/pontos-turisticos", pontosTuristicosRoutes)
routes.use("/api/eventos", eventosRoutes)

export { routes }