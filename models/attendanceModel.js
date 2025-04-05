const db = require("../config/db");

const Attendance = {
    logEntry: async (userId, timestamp, status) => {
        const [result] = await db.query(
            "INSERT INTO attendance (user_id, timestamp, status) VALUES (?, ?, ?)",
            [userId, timestamp, status]
        );
        return result;
    },

    getAll: async () => {
        const [rows] = await db.query("SELECT * FROM attendance");
        return rows;
    }
};

module.exports = Attendance;
