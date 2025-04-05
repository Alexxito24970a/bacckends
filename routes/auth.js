import express from "express";
import { register, login } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; // ✅ Importar desde un middleware separado
import { body } from "express-validator";

const router = express.Router();

// ✅ Ruta de registro de usuario con validaciones
router.post("/register", [
    body("email").isEmail(),
    body("password").isLength({ min: 6 })
], register);

// ✅ Ruta de login
router.post("/login", login);

// ✅ Ruta protegida para probar autenticación
router.get("/profile", authMiddleware, (req, res) => {
    res.json({ message: "Acceso permitido", user: req.user });
});

export default router;
