import db from "../config/db.js";
import axios from "axios";

export const syncAllDevices = async () => {
  try {
    const [devices] = await db.query("SELECT * FROM devices WHERE status = 'active'");

    for (const device of devices) {
      const { name, ip_address, port, connection_type } = device;

      try {
        if (connection_type === "webapi" || connection_type === "sdk" || connection_type === "tcpip") {
          // Enviar a tu propio backend
          const response = await axios.post("http://localhost:5000/api/attendance/sync", {
            deviceIp: ip_address,
            port,
            connection_type,
          });

          console.log(`✅ ${name} (${connection_type}): ${response.data.message}`);
        } else {
          console.warn(`⚠️ Tipo de conexión desconocido en ${name}: ${connection_type}`);
        }
      } catch (err) {
        console.error(`❌ Error al sincronizar ${name} (${connection_type}):`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Error obteniendo dispositivos:", err.message);
  }
};
