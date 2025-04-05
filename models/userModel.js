const db = require("../config/db");

const User = {
    create: async (name, email, password, role) => {
        const [result] = await db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, password, role]
        );
        return result;
    },
    
    findByEmail: async (email) => {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        return rows[0];
    }
};

module.exports = User;
