import db from "../config/db.js";
import axios from "axios";
import { io } from "../server.js"; // ✅ Importamos Socket.io

// 🔹 Recibir registros desde la app C# con zkemkeeper
const receiveZKRecords = async (req, res) => {
  try {
    const registros = req.body; // esperamos un array

    if (!Array.isArray(registros)) {
      return res.status(400).json({ message: "Formato inválido. Se esperaba un array." });
    }

    let insertados = 0;
    let ignorados = 0;

    for (const r of registros) {
      const { user_id, timestamp, status } = r;

      const [result] = await db.query(
        `INSERT INTO attendance (user_id, timestamp, status)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE timestamp = VALUES(timestamp), status = VALUES(status)`,
        [user_id, timestamp, status]
      );

      if (result.affectedRows > 0) insertados++;
      else ignorados++;
    }

    res.json({ message: `✅ Se recibieron ${insertados} registros. Ignorados: ${ignorados}` });
  } catch (error) {
    console.error("❌ Error al recibir registros ZKTeco:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

// 🔹 Obtener registros de asistencia con filtros y paginación
const getAttendanceRecords = async (req, res) => {
    try {
      const { fechaInicio, fechaFin, userId, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;
      const params = [];
  
      let query = `
        SELECT 
          a.id, a.user_id, u.name AS user_name, a.timestamp, a.status
        FROM 
          attendance a
        JOIN 
          users u ON a.user_id = u.id
        WHERE 
          1 = 1`;
  
      if (fechaInicio) {
        query += " AND a.timestamp >= ?";
        params.push(`${fechaInicio} 00:00:00`);
      }
      if (fechaFin) {
        query += " AND a.timestamp <= ?";
        params.push(`${fechaFin} 23:59:59`);
      }
      if (userId && !isNaN(userId)) {
        query += " AND a.user_id = ?";
        params.push(userId);
      }
  
      query += " ORDER BY a.timestamp DESC LIMIT ? OFFSET ?";
      params.push(parseInt(limit), parseInt(offset));
  
      const [rows] = await db.query(query, params);
  
      // ✅ Contar total para paginación
      const [count] = await db.query("SELECT COUNT(*) as total FROM attendance WHERE 1=1", []);
      res.json({
        data: rows,
        total: count[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
      });
  
    } catch (error) {
      console.error("❌ Error en getAttendanceRecords:", error);
      res.status(500).json({ error: error.message });
    }
  };
  
  export const syncAllDevices = async (req, res) => {
    try {
      const [devices] = await db.query("SELECT * FROM devices WHERE status = 'active'");
  
      let totalRegistros = 0;
      for (const device of devices) {
        if (device.connection_type === "webapi" || device.connection_type === "sdk") {
          try {
            const url = `http://${device.ip_address}:${device.port}/attendance`;
            const response = await axios.get(url);
  
            for (const record of response.data) {
              const [result] = await db.query(
                `INSERT INTO attendance (user_id, timestamp, status)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE timestamp = VALUES(timestamp), status = VALUES(status)`,
                [record.user_id, record.timestamp, record.status]
              );
  
              if (result.affectedRows > 0) {
                io.emit("newAttendance", {
                  userId: record.user_id,
                  timestamp: record.timestamp,
                  status: record.status,
                });
                totalRegistros++;
              }
            }
  
          } catch (error) {
            console.error(`❌ Error sincronizando ${device.name}:`, error.message);
          }
        }
      }
  
      res.json({ message: `✅ Sincronización completada: ${totalRegistros} registros insertados.` });
    } catch (error) {
      console.error("❌ Error en syncAllDevices:", error);
      res.status(500).json({ error: "Error al sincronizar todos los dispositivos." });
    }
  };
// 🔹 Sincronizar registros de dispositivos ZKTeco modernos (por IP)
export const syncAttendance = async (req, res) => {
  try {
    const { deviceIp, port, connection_type } = req.body;

    if (!deviceIp || !port) {
      return res.status(400).json({ message: "IP y puerto del dispositivo son obligatorios" });
    }

    console.log(`🔄 Sincronizando ${deviceIp}:${port} (${connection_type})`);

    // Simulamos que cada tipo de conexión requiere una ruta diferente
    let url = "";

    if (connection_type === "webapi") {
      url = `http://${deviceIp}:${port}/api/attendance`; // Simulación
    } else if (connection_type === "sdk") {
      url = `http://localhost:5000/api/attendance/from-zkteco`; // SDK antiguo (envía desde consola)
    } else if (connection_type === "tcpip") {
      url = `http://${deviceIp}:${port}/api/attendance`; // Simulación TCP/IP
    } else {
      return res.status(400).json({ message: "Tipo de conexión no soportado" });
    }

    // Aquí simularíamos recibir datos si fuera conexión real
    const response = await axios.get(url);

    let insertados = 0;
    for (const record of response.data) {
      const [result] = await db.query(
        `INSERT INTO attendance (user_id, timestamp, status)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE timestamp = VALUES(timestamp), status = VALUES(status)`,
        [record.user_id, record.timestamp, record.status]
      );

      if (result.affectedRows > 0) {
        insertados++;
        // Emitimos evento si quieres usar WebSocket
      }
    }

    res.json({ message: `✔️ ${insertados} registros sincronizados` });

  } catch (error) {
    console.error("❌ Error en syncAttendance:", error);
    res.status(500).json({ error: "Error al sincronizar dispositivo" });
  }
};


// 🔹 Obtener los últimos 5 registros para el dashboard
const getRecentAttendance = async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT 
           a.id, a.user_id, u.name AS user_name, a.timestamp, a.status 
         FROM 
           attendance a
         JOIN 
           users u ON a.user_id = u.id
         ORDER BY 
           a.timestamp DESC 
         LIMIT 5`
      );
  
      res.json(rows); // 🔄 Ahora incluye `user_name`
    } catch (error) {
      console.error("❌ Error en getRecentAttendance:", error);
      res.status(500).json({ message: "Error al obtener actividad reciente" });
    }
  };
  

// ✅ Exportación agrupada (IMPORTANTE)
export {
  receiveZKRecords,
  getAttendanceRecords,
  getRecentAttendance,
};
