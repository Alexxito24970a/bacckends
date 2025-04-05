import db from "../config/db.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// 🔹 Exportar asistencia a Excel
export const generateExcelReport = async (req, res) => {
    try {
        const [attendance] = await db.query("SELECT * FROM attendance");

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Asistencia");

        worksheet.columns = [
            { header: "ID", key: "id", width: 10 },
            { header: "Usuario", key: "user_id", width: 20 },
            { header: "Fecha y Hora", key: "timestamp", width: 25 },
            { header: "Estado", key: "status", width: 15 },
        ];

        worksheet.addRows(attendance);

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=asistencia.xlsx");

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("❌ Error en generateExcelReport:", error);
        res.status(500).json({ error: error.message });
    }
};

// 🔹 Exportar asistencia a PDF
export const generatePDFReport = async (req, res) => {
    try {
        const [attendance] = await db.query("SELECT * FROM attendance");

        const tempDir = path.join("backend", "temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const filePath = path.join(tempDir, "reporte_asistencia.pdf");
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        doc.fontSize(16).text("Reporte de Asistencia", { align: "center" });
        doc.moveDown();

        if (attendance.length === 0) {
            doc.fontSize(12).text("No hay registros de asistencia disponibles.");
        } else {
            doc.fontSize(12).text("ID   | Usuario   | Fecha y Hora   | Estado");
            doc.moveDown();

            attendance.forEach((record) => {
                doc.fontSize(10).text(`${record.id} | ${record.user_id} | ${record.timestamp} | ${record.status}`);
            });
        }

        doc.end();

        writeStream.on("finish", () => {
            res.download(filePath, "reporte_asistencia.pdf", (err) => {
                if (err) {
                    console.error("❌ Error al descargar PDF:", err);
                    res.status(500).json({ error: "Error al descargar PDF." });
                }
                fs.unlinkSync(filePath);
            });
        });

    } catch (error) {
        console.error("❌ Error en generatePDFReport:", error);
        res.status(500).json({ error: error.message });
    }
};

// 🔹 Obtener estadísticas de asistencia (con filtro opcional por usuario)
export const getAttendanceStats = async (req, res) => {
    try {
        const { userId } = req.query;
        let query = "SELECT status, COUNT(*) as total FROM attendance";
        let params = [];

        if (userId) {
            query += " WHERE user_id = ?";
            params.push(userId);
        }

        query += " GROUP BY status";

        const [stats] = await db.query(query, params);

        res.json(stats);
    } catch (error) {
        console.error("❌ Error en getAttendanceStats:", error);
        res.status(500).json({ error: error.message });
    }
};

// 🔹 Obtener datos para gráficos de asistencia (con filtro opcional por usuario)
export const getChartAttendance = async (req, res) => {
    try {
        const { range, userId } = req.query;
        let dateQuery = "DATE(timestamp)";
        const params = [];

        // 📅 Mejor agrupación visual: semana (año-semana) y mes (año-mes)
        if (range === "week") {
            dateQuery = "DATE_FORMAT(timestamp, '%Y-%u')";
        } else if (range === "month") {
            dateQuery = "DATE_FORMAT(timestamp, '%Y-%m')";
        }

        let query = `
            SELECT ${dateQuery} as date, 
                   SUM(CASE WHEN status = 'entrada' THEN 1 ELSE 0 END) as entradas,
                   SUM(CASE WHEN status = 'salida' THEN 1 ELSE 0 END) as salidas
            FROM attendance`;

        if (userId && !isNaN(userId)) {
            query += " WHERE user_id = ?";
            params.push(Number(userId));
        }

        query += " GROUP BY date ORDER BY date ASC";

        console.log("📊 Ejecutando consulta con:", { range, userId, query, params });

        const [chartData] = await db.query(query, params);
        res.json(chartData);
    } catch (error) {
        console.error("❌ Error en getChartAttendance:", error);
        res.status(500).json({ error: error.message });
    }
};
