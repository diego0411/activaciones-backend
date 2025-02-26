const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Conexión a PostgreSQL
const verificarToken = require('../middleware/authMiddleware');

// 📌 Ruta para registrar una activación
router.post('/', verificarToken, async (req, res) => {
    try {
        const {
            lugar_activacion, fecha, se_descargo_app, registro, cash_in, cash_out, 
            p2p, qr_fisico, respaldo, hubo_error, tipo, nombre, apellido, 
            cedula_identidad, telefono, correo, fotos, tipo_error, clasificacion_comercio
        } = req.body;

        // Verifica que los valores no sean undefined
        if (!lugar_activacion || !fecha || !tipo || !nombre || !apellido || !cedula_identidad || !telefono) {
            return res.status(400).json({ message: "❌ Faltan datos obligatorios." });
        }

        // 📌 Corrección de la consulta SQL
        const query = `
            INSERT INTO activaciones (
                usuario_id, lugar_activacion, fecha, se_descargo_app, registro, cash_in, cash_out, 
                p2p, qr_fisico, respaldo, hubo_error, tipo, nombre, apellido, 
                cedula_identidad, telefono, correo, fotos, tipo_error, clasificacion_comercio, created_at
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW()) 
            RETURNING *`;

        const values = [
            req.usuario_id, lugar_activacion, fecha, se_descargo_app, registro, cash_in, cash_out,
            p2p, qr_fisico, respaldo, hubo_error, tipo, nombre, apellido,
            cedula_identidad, telefono, correo, fotos, tipo_error, clasificacion_comercio
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: "✅ Activación registrada con éxito",
            activacion: result.rows[0]
        });

    } catch (error) {
        console.error("❌ Error al registrar activación:", error);
        res.status(500).json({ message: "Error al registrar activación", error });
    }
});

module.exports = router;
