import express from "express";
import {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  syncAllDevices
} from "../controllers/devicesController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

// (Opcional) Un middleware para verificar admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acceso denegado. Solo administradores." });
  }
  next();
};

const router = express.Router();

// 🔹 Rutas CRUD básicas
router.get("/", authMiddleware, isAdmin, getDevices);
router.post("/", authMiddleware, isAdmin, createDevice);
router.put("/:id", authMiddleware, isAdmin, updateDevice);
router.delete("/:id", authMiddleware, isAdmin, deleteDevice);

// 🔹 Ruta para “Sincronizar TODOS”
router.post("/sync-all", authMiddleware, isAdmin, syncAllDevices);

export default router;
