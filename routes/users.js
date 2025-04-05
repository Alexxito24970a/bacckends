import express from "express";
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updatePassword
} from "../controllers/userController.js";
import { body, validationResult } from "express-validator";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔒 Middleware local: solo admins
const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Acceso denegado. Solo administradores." });
    }
    next();
};

// ✅ Middleware para validaciones
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// ✅ Obtener todos los usuarios
router.get("/", authMiddleware, isAdmin, getUsers);

// ✅ Obtener un usuario por ID
router.get("/:id", authMiddleware, isAdmin, getUserById);

// ✅ Crear usuario
router.post(
    "/",
    authMiddleware,
    isAdmin,
    [
        body("name").notEmpty().withMessage("El nombre es obligatorio"),
        body("email").isEmail().withMessage("Correo inválido"),
        body("password").isLength({ min: 6 }).withMessage("Contraseña mínimo 6 caracteres"),
        body("role").isIn(["admin", "empleado"]).withMessage("Rol inválido"),
        validate,
    ],
    createUser
);

// ✅ Actualizar usuario
router.put(
    "/:id",
    authMiddleware,
    isAdmin,
    [
        body("name").notEmpty().withMessage("El nombre es obligatorio"),
        body("email").isEmail().withMessage("Correo inválido"),
        body("role").isIn(["admin", "empleado"]).withMessage("Rol inválido"),
        validate,
    ],
    updateUser
);

// ✅ Eliminar usuario
router.delete("/:id", authMiddleware, isAdmin, deleteUser);

// ✅ Cambiar contraseña
router.put(
    "/:id/password",
    authMiddleware,
    isAdmin,
    [
        body("newPassword").isLength({ min: 6 }).withMessage("La nueva contraseña debe tener al menos 6 caracteres"),
        validate
    ],
    updatePassword
);

export default router;
