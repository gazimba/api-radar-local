import { Router } from "express"
import { usuariosRoutes } from "./usuarios-routes"
import { pontosTuristicosRoutes } from "./pontos-turisticos-routes"
import { eventosRoutes } from "./eventos-routes"

const routes = Router()
//public
routes.use("/usuarios", usuariosRoutes)
routes.use("/pontos-turisticos", pontosTuristicosRoutes)
routes.use("/eventos", eventosRoutes)

export { routes }