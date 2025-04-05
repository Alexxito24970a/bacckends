import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Extraer el token correctamente

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado, token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ Token inválido:", error);
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};

// Middleware para verificar si el usuario es admin
export const isAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Acceso denegado: Solo administradores." });
    }
    next();
};