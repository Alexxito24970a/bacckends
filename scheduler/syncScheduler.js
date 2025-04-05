// backend/scheduler/syncScheduler.js
import db from "../config/db.js";
import axios from "axios";

export const startSyncScheduler = () => {
  const interval = 5 * 60 * 1000; // Cada 5 minutos

  setInterval(async () => {
    console.log("🔄 Intentando sincronizar dispositivos automáticamente...");

    const [devices] = await db.query("SELECT * FROM devices WHERE status = 'activo'");

    for (const device of devices) {
      try {
        const response = await axios.post("http://localhost:5000/api/devices/sync-all", {
          deviceIp: device.ip_address,
          port: device.port
        });

        console.log(`✅ ${device.name}: ${response.data.message}`);
      } catch (err) {
        console.warn(`⚠️ No se pudo conectar a ${device.name} (${device.ip_address})`);
      }
    }
  }, interval);
};
