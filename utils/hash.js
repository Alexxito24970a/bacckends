// utils/hash.js
const bcrypt = require("bcryptjs");

const plainPassword = "567832";
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log("🔐 Contraseña hasheada:", hash);
});
