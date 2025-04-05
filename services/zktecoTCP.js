import net from "net";

const getAttendance = async (deviceIP, port = 4370) => {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        let receivedData = Buffer.alloc(0);

        client.connect(port, deviceIP, () => {
            console.log("✅ Conectado al dispositivo ZKTeco en", deviceIP);
            
            // 🔹 Comando específico de ZKTeco para obtener registros de asistencia
            const command = Buffer.from([0x50, 0x00, 0x00, 0x00, 0x00, 0x00]); // Comando ZKTeco (ejemplo)
            client.write(command);
        });

        client.on("data", (data) => {
            console.log("📥 Datos recibidos:", data);
            receivedData = Buffer.concat([receivedData, data]);
        });

        client.on("end", () => {
            console.log("📌 Datos completos recibidos");
            resolve(receivedData);
            client.destroy();
        });

        client.on("error", (err) => {
            console.error("❌ Error en conexión TCP/IP:", err.message);
            reject(err);
            client.destroy();
        });

        client.on("close", () => {
            console.log("🔌 Conexión cerrada con el dispositivo.");
        });

        // 🔹 Si no responde en 10s, cerrar conexión
        setTimeout(() => {
            console.log("⏳ Tiempo de espera agotado. Cerrando conexión.");
            client.destroy();
            reject(new Error("Tiempo de espera agotado"));
        }, 10000);
    });
};

export default getAttendance;
