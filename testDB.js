const db = require('./config/db');

async function testDB() {
    try {
        const [rows] = await db.query("SELECT 1 + 1 AS result");
        console.log("Conexión exitosa:", rows);
    } catch (error) {
        console.error("Error en la conexión:", error);
    }
}

testDB();
