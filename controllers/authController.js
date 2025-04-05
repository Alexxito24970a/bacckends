import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// ✅ Registrar usuario
export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    try {
        const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) return res.status(400).json({ message: "El usuario ya existe" });

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
            [name, email, hashedPassword, role || "empleado"]);

        res.json({ message: "Usuario registrado exitosamente" });
    } catch (error) {
        console.error("❌ Error en registro:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Iniciar sesión
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) return res.status(400).json({ message: "Credenciales incorrectas" });

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Credenciales incorrectas" });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        console.error("❌ Error en login:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Middleware de autenticación
export const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Extraer el token correctamente
    if (!token) return res.status(401).json({ message: "Acceso denegado, token no proporcionado" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ Token inválido:", error);
        res.status(401).json({ message: "Token inválido o expirado" });
    }
};

// ✅ Obtener perfil del usuario autenticado
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [users] = await db.query("SELECT id, name, role FROM users WHERE id = ?", [userId]);

        if (users.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

        res.json({ user: users[0] });
    } catch (error) {
        console.error("❌ Error en getProfile:", error);
        res.status(500).json({ error: error.message });
    }
};
