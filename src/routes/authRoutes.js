const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Importar la conexión a la BD

const router = express.Router(); // 🔹 Definir el router

// Endpoint de Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const userResult = await pool.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "Correo o contraseña incorrectos" });
        }

        const user = userResult.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Correo o contraseña incorrectos" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: "2h" } // Expira en 2 horas
        );

        res.json({ message: "Inicio de sesión exitoso", token });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: "Error en el servidor", error });
    }
});

module.exports = router;
