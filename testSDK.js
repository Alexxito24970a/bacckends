const ZKLib = require("node-zklib");

async function testConnection() {
    try {
        let zkInstance = new ZKLib("192.168.1.100", 4370, 10000, 4000); // Cambia la IP por la de tu dispositivo
        await zkInstance.createSocket();
        console.log("✅ Conectado al dispositivo ZKTeco");

        const logs = await zkInstance.getAttendances();
        console.log("Registros de asistencia:", logs);

        await zkInstance.disconnect();
    } catch (error) {
        console.error("❌ Error al conectar con ZKTeco:", error.message);
    }
}

testConnection();
