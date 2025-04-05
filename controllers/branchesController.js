// backend/controllers/branchesController.js
import db from "../config/db.js";
import { validationResult } from "express-validator";

// 🔹 Obtener todas las sucursales
export const getBranches = async (req, res) => {
  try {
    const [branches] = await db.query("SELECT * FROM branches ORDER BY created_at DESC");
    res.json(branches);
  } catch (error) {
    console.error("❌ Error al obtener sucursales:", error);
    res.status(500).json({ error: "Error al obtener sucursales" });
  }
};

// 🔹 Crear sucursal
export const createBranch = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, location, status } = req.body;

  try {
    await db.query("INSERT INTO branches (name, location, status) VALUES (?, ?, ?)", [name, location, status]);
    res.status(201).json({ message: "Sucursal creada correctamente" });
  } catch (error) {
    console.error("❌ Error al crear sucursal:", error);
    res.status(500).json({ error: "Error al crear sucursal" });
  }
};

// 🔹 Editar sucursal
export const updateBranch = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, location, status } = req.body;

  try {
    await db.query("UPDATE branches SET name = ?, location = ?, status = ? WHERE id = ?", [name, location, status, id]);
    res.json({ message: "Sucursal actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar sucursal:", error);
    res.status(500).json({ error: "Error al actualizar sucursal" });
  }
};

// 🔹 Eliminar sucursal
export const deleteBranch = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM branches WHERE id = ?", [id]);
    res.json({ message: "Sucursal eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar sucursal:", error);
    res.status(500).json({ error: "Error al eliminar sucursal" });
  }
};
