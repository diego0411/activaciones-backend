const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Importar la conexión a la BD

const router = express.Router(); // 🔹 Definir el router

// 📌 Endpoint de Login
router.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;

        // 📌 Validaciones básicas
        if (!email || !password) {
            return res.status(400).json({ message: "❌ Email y contraseña son obligatorios." });
        }

        email = email.trim().toLowerCase(); // Normalizar email

        // 📌 Verificar formato de email
        const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "❌ Formato de email inválido." });
        }

        // 📌 Buscar usuario en la base de datos
        const userQuery = 'SELECT id, email, password, role FROM users WHERE email = $1';
        const userResult = await pool.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "❌ Correo o contraseña incorrectos." });
        }

        const user = userResult.rows[0];

        // 📌 Comparar contraseña encriptada
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "❌ Correo o contraseña incorrectos." });
        }

        // 📌 Verificar que la variable JWT_SECRET esté configurada
        if (!process.env.JWT_SECRET) {
            console.error("⚠️ JWT_SECRET no está definido en el entorno.");
            return res.status(500).json({ message: "Error interno del servidor." });
        }

        // 📌 Generar token con JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "2h" } // Expira en 2 horas
        );

        // 📌 Respuesta con token
        res.status(200).json({
            message: "✅ Inicio de sesión exitoso",
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        console.error("❌ Error en el login:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

module.exports = router;
