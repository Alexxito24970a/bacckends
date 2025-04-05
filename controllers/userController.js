import db from "../config/db.js";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";

// ✅ Obtener todos los usuarios
export const getUsers = async (req, res) => {
    const [users] = await db.query("SELECT id, name, email, role FROM users");
    res.json(users);
};
// 🔹 Obtener un usuario por ID
export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [id]);
        if (users.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(users[0]);
    } catch (error) {
        console.error("❌ Error al obtener usuario:", error);
        res.status(500).json({ error: "Error al obtener usuario" });
    }
};
// ✅ Crear nuevo usuario
export const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;

    try {
        const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existing.length > 0) return res.status(400).json({ message: "El correo ya está registrado" });

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role]
        );

        res.json({ message: "Usuario creado correctamente" });
    } catch (error) {
        console.error("❌ Error en createUser:", error);
        res.status(500).json({ error: error.message });
    }
};

// 🔹 Actualizar usuario
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role } = req.body;

    try {
        const [existing] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        await db.query("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?", [
            name || existing[0].name,
            email || existing[0].email,
            role || existing[0].role,
            id,
        ]);

        res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error("❌ Error al actualizar usuario:", error);
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
};
// ✅ Eliminar usuario
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM users WHERE id = ?", [id]);
        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error("❌ Error en deleteUser:", error);
        res.status(500).json({ error: error.message });
    }
};
// ✅ Actualizar contraseña
export const updatePassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ message: "La nueva contraseña es requerida" });
    }

    try {
        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, id]);

        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (err) {
        console.error("❌ Error al actualizar contraseña:", err);
        res.status(500).json({ message: "Error al actualizar la contraseña" });
    }
};

