const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Crear usuario con contraseña hasheada
const createUser = async (name, email, password) => {
    try {
        // Verificar si el usuario ya existe
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            throw new Error("El usuario ya está registrado.");
        }

        // Hashear la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        return result.rows[0]; // Retornar solo los datos necesarios
    } catch (error) {
        console.error("Error al crear usuario:", error.message);
        throw error;
    }
};

// Obtener usuario por email
const getUserByEmail = async (email) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, password FROM users WHERE email = $1',
            [email]
        );

        return result.rows[0] || null;
    } catch (error) {
        console.error("Error al obtener usuario por email:", error.message);
        throw error;
    }
};

module.exports = { createUser, getUserByEmail };
