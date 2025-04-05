import express from "express";
import { 
    generateExcelReport, 
    generatePDFReport, 
    getAttendanceStats, 
    getChartAttendance // ✅ Asegúrate de que esta función esté implementada en el controlador
} from "../controllers/reportsController.js";

const router = express.Router();

router.get("/export/excel", generateExcelReport);
router.get("/export/pdf", generatePDFReport);
router.get("/stats", getAttendanceStats);
router.get("/chart/attendance", getChartAttendance); // ✅ Nueva ruta para gráficos

export default router;
