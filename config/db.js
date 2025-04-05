import mysql from 'mysql2/promise';

// Configuración de la base de datos
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'biometric_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// ✅ Exporta la conexión y `connectDB`
export const connectDB = async () => {
    try {
        await db.getConnection();
        console.log("✅ Conexión a la base de datos establecida");
    } catch (error) {
        console.error("❌ Error conectando a la base de datos:", error.message);
        process.exit(1);
    }
};

export default db;
