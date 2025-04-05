// backend/routes/branches.js
import express from "express";
import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from "../controllers/branchesController.js";
import { body, validationResult } from "express-validator";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
// Middleware para validar datos
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const router = express.Router();

// Obtener todas las sucursales
router.get("/", authMiddleware, getBranches);

// Crear nueva sucursal
router.post(
  "/",
  authMiddleware,
  [
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("address").notEmpty().withMessage("La dirección es obligatoria"),
    validate,
  ],
  createBranch
);

// Editar sucursal
router.put(
  "/:id",
  authMiddleware,
  [
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("address").notEmpty().withMessage("La dirección es obligatoria"),
    validate,
  ],
  updateBranch
);

// Eliminar sucursal
router.delete("/:id", authMiddleware, deleteBranch);

export default router;
