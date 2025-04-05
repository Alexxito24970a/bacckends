import axios from "axios";

const getAttendance = async (deviceIP) => {
    try {
        const response = await axios.get(`http://${deviceIP}/api/attendance`);
        return response.data;
    } catch (error) {
        console.error("❌ Error obteniendo asistencia:", error.message);
        return null;
    }
};

// ✅ Exportación correcta
export default { getAttendance };
