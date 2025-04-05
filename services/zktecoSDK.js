import ZKLib from "node-zklib";

const getAttendance = async (deviceIP, port = 4370) => {
    let zkInstance = null;
    
    try {
        zkInstance = new ZKLib(deviceIP, port, 10000, 4000);
        await zkInstance.createSocket(); // 🔹 Conectar al dispositivo

        const logs = await zkInstance.getAttendances();
        return logs;

    } catch (error) {
        console.error("❌ Error en SDK ZKTeco:", error.message);
        return null;

    } finally {
        if (zkInstance) {
            await zkInstance.disconnect(); // 🔹 Asegurar que la conexión se cierra
        }
    }
};

export default getAttendance;
