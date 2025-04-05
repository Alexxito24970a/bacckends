import db from "../config/db.js";
import axios from "axios";
import { io } from "../server.js";  // si ocupas emitir eventos en tiempo real

// 🔹 Obtener todos los dispositivos
export const getDevices = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, b.name as branch_name
      FROM devices d
      LEFT JOIN branches b ON d.branch_id = b.id
      ORDER BY d.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener dispositivos:", error);
    res.status(500).json({ error: "Error al obtener dispositivos" });
  }
};

// 🔹 Crear un dispositivo
export const createDevice = async (req, res) => {
  try {
    const { name, ip_address, port, connection_type, status, branch_id } = req.body;

    // Validaciones mínimas
    if (!name || !ip_address || !connection_type) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    await db.query(
      "INSERT INTO devices (name, ip_address, port, connection_type, status, branch_id) VALUES (?, ?, ?, ?, ?, ?)",
      [name, ip_address, port || 4370, connection_type, status || "active", branch_id || null]
    );

    res.status(201).json({ message: "✅ Dispositivo creado correctamente" });
  } catch (error) {
    console.error("❌ Error al crear dispositivo:", error);
    res.status(500).json({ error: "Error al crear dispositivo" });
  }
};

// 🔹 Actualizar dispositivo
export const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ip_address, port, connection_type, status, branch_id } = req.body;

    await db.query(
      "UPDATE devices SET name=?, ip_address=?, port=?, connection_type=?, status=?, branch_id=? WHERE id=?",
      [name, ip_address, port, connection_type, status, branch_id, id]
    );

    res.json({ message: "✅ Dispositivo actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar dispositivo:", error);
    res.status(500).json({ error: "Error al actualizar dispositivo" });
  }
};

// 🔹 Eliminar dispositivo
export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM devices WHERE id = ?", [id]);
    res.json({ message: "✅ Dispositivo eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar dispositivo:", error);
    res.status(500).json({ error: "Error al eliminar dispositivo" });
  }
};

/* ---------------------------------------------------------------------
   🔹 Sincronizar TODOS los dispositivos (ruta /sync-all)
   1) Lee la tabla devices
   2) Según connection_type, hace la lógica de sincronizar
   3) Retorna cuántos fueron OK y cuántos fallaron
--------------------------------------------------------------------- */
export const syncAllDevices = async (req, res) => {
  try {
    // 1) Obtenemos todos (o solo 'active') según tu preferencia:
    //    SELECT * FROM devices WHERE status='active'
    //    o SELECT * FROM devices
    const [devices] = await db.query("SELECT * FROM devices");

    let totalSynced = 0;
    let totalFailed = 0;

    // 2) Iteramos cada dispositivo y aplicamos lógica
    for (const dev of devices) {
      try {
        if (dev.connection_type === "webapi") {
          // Ejemplo: Dispositivo ZKTeco con /attendance
          const url = `http://${dev.ip_address}:${dev.port}/attendance`;
          const response = await axios.get(url);

          // Aquí parseas response.data y guardas en DB
          // ...
          // Dispositivo OK:
          totalSynced++;

          // (Opcional) Actualizar su status a "activo"
          await db.query("UPDATE devices SET status='active' WHERE id=?", [dev.id]);
        }
        else if (dev.connection_type === "sdk") {
          // TODO: Llamar a tu microservicio .NET, o algo similar
          // ...
          totalSynced++;
        }
        else if (dev.connection_type === "tcpip") {
          // TODO: Otra lógica
          // ...
          totalSynced++;
        }
        else {
          // Si no reconocemos el tipo
          totalFailed++;
          await db.query("UPDATE devices SET status='inactive' WHERE id=?", [dev.id]);
        }
      } catch (err) {
        console.error(`❌ Error al sincronizar el dispositivo [${dev.name}]:`, err.message);
        totalFailed++;

        // (Opcional) Marcar el dispositivo con status='error'
        await db.query("UPDATE devices SET status='error' WHERE id=?", [dev.id]);
      }
    }

    // 3) Retornamos un mensaje con totales
    res.json({
      message: `Sincronización completada. Exitos: ${totalSynced}, Fallos: ${totalFailed}`,
      totalSynced,
      totalFailed
    });
  } catch (error) {
    console.error("❌ Error en syncAllDevices:", error);
    res.status(500).json({ error: error.message });
  }
};
