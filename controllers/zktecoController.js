import db from "../config/db.js";
import zktecoWebAPI from "../services/zktecoWebAPI.js";
import zktecoSDK from "../services/zktecoSDK.js";
import zktecoTCP from "../services/zktecoTCP.js";

// 🔹 Obtener registros de asistencia de un dispositivo ZKTeco
export const getAttendance = async (req, res) => {
    try {
        const { deviceId } = req.params;

        // Buscar el dispositivo en la base de datos
        const [devices] = await db.query("SELECT * FROM devices WHERE id = ?", [deviceId]);
        if (devices.length === 0) {
            return res.status(404).json({ message: "Dispositivo no encontrado" });
        }

        // Extraer los datos correctamente
        const device = devices[0]; 
        const { connection_type, ip_address, port } = device;

        let logs = [];

        if (connection_type === "webapi") {
            logs = await zktecoWebAPI.getAttendance(ip_address);
        } else if (connection_type === "sdk") {
            logs = await zktecoSDK.getAttendance(ip_address, port);
        } else if (connection_type === "tcpip") {
            logs = await zktecoTCP.getAttendance(ip_address, port);
        } else {
            return res.status(400).json({ message: "Tipo de conexión no válido" });
        }

        res.json(logs);
    } catch (error) {
        console.error("❌ Error en getAttendance:", error);
        res.status(500).json({ error: error.message });
    }
};
