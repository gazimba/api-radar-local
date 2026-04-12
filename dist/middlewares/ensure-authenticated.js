import jwt from "jsonwebtoken";
import authConfig from "../config/auth";
const { verify } = jwt;
export function ensureAuthenticated(request, response, next) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        return response.status(401).json({ message: "Token não informado" });
    }
    const parts = authHeader.split(" ");
    if (parts.length !== 2) {
        return response.status(401).json({ message: "Formato de token inválido" });
    }
    const token = parts[1];
    if (!token) {
        return response.status(401).json({ message: "Token malformado" });
    }
    try {
        const decoded = verify(token, authConfig.jwt.secret);
        request.user = {
            id: Number(decoded.sub),
        };
        return next();
    }
    catch {
        return response.status(401).json({ message: "Token inválido ou expirado" });
    }
}
//# sourceMappingURL=ensure-authenticated.js.map