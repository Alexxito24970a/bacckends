import express from "express";
import {
  getAttendanceRecords,
  syncAttendance,
  getRecentAttendance,
  receiveZKRecords,
} from "../controllers/attendanceController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; // ✅ Importación agregada   
const router = express.Router();
import { syncAllDevices } from "../utils/syncAllDevices.js";
router.get("/all", getAttendanceRecords);
router.post("/sync", syncAttendance);
router.get("/recent", authMiddleware, getRecentAttendance); // ✅ Endpoint protegido
router.post("/from-zkteco", receiveZKRecords); // nueva ruta
router.post("/sync-all", syncAllDevices); // ✅ Nueva ruta global
router.post("/sync-all", async (req, res) => {
  try {
    await syncAllDevices();
    res.json({ message: "✅ Todos los dispositivos sincronizados." });
  } catch (err) {
    res.status(500).json({ error: "❌ Falló la sincronización global." });
  }
});
// POST /api/attendance/from-device
router.post("/from-device", async (req, res) => {
    try {
      const registros = req.body;
  
      for (const r of registros) {
        await db.query(
          `INSERT INTO attendance (user_id, timestamp, status)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE timestamp = VALUES(timestamp), status = VALUES(status)`,
          [r.user_id, r.timestamp, r.status]
        );
      }
  
      res.json({ message: "Registros insertados correctamente", count: registros.length });
    } catch (err) {
      console.error("❌ Error insertando registros:", err);
      res.status(500).json({ error: "Error insertando registros" });
    }
  });
  
export default router;
