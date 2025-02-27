const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Conexión a PostgreSQL
const verificarToken = require('../middleware/authMiddleware');

// 📌 Ruta para registrar una activación
router.post('/', verificarToken, async (req, res) => {
    try {
        // Extraer datos del cuerpo de la petición
        let {
            lugar_activacion, fecha, se_descargo_app, registro, cash_in, cash_out, 
            p2p, qr_fisico, respaldo, hubo_error, tipo, nombre, apellido, 
            cedula_identidad, telefono, correo, fotos, tipo_error, clasificacion_comercio
        } = req.body;

        // 📌 Limpieza y normalización de datos
        lugar_activacion = lugar_activacion?.trim();
        fecha = new Date(fecha); // Asegurar formato de fecha válido
        nombre = nombre?.trim();
        apellido = apellido?.trim();
        cedula_identidad = cedula_identidad?.trim();
        telefono = telefono?.trim();
        correo = correo?.trim();
        fotos = fotos ? JSON.stringify(fotos) : null; // Convertir a string si es un array

        // 📌 Validaciones de datos obligatorios
        if (!lugar_activacion || !fecha || !tipo || !nombre || !apellido || !cedula_identidad || !telefono) {
            return res.status(400).json({ message: "❌ Faltan datos obligatorios." });
        }

        // 📌 Verificar formato de cédula de identidad (solo números)
        if (!/^\d+$/.test(cedula_identidad)) {
            return res.status(400).json({ message: "❌ La cédula de identidad debe contener solo números." });
        }

        // 📌 Validar formato de correo si existe
        if (correo && !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(correo)) {
            return res.status(400).json({ message: "❌ Correo electrónico no válido." });
        }

        // 📌 Verificar tipo de activación permitido
        const tiposPermitidos = ["básico", "premium", "empresarial"];
        if (!tiposPermitidos.includes(tipo.toLowerCase())) {
            return res.status(400).json({ message: "❌ Tipo de activación no válido." });
        }

        // 📌 Consulta SQL corregida y optimizada
        const query = `
            INSERT INTO activaciones (
                usuario_id, lugar_activacion, fecha, se_descargo_app, registro, cash_in, cash_out, 
                p2p, qr_fisico, respaldo, hubo_error, tipo, nombre, apellido, 
                cedula_identidad, telefono, correo, fotos, tipo_error, clasificacion_comercio, created_at
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW()) 
            RETURNING *`;

        const values = [
            req.usuario_id, lugar_activacion, fecha, se_descargo_app || false, registro || false, cash_in || 0, cash_out || 0,
            p2p || false, qr_fisico || false, respaldo || false, hubo_error || false, tipo, nombre, apellido,
            cedula_identidad, telefono, correo, fotos, tipo_error || null, clasificacion_comercio || null
        ];

        const result = await pool.query(query, values);

        // 📌 Respuesta con éxito
        res.status(201).json({
            message: "✅ Activación registrada con éxito",
            activacion: result.rows[0]
        });

    } catch (error) {
        console.error("❌ Error al registrar activación:", error);
        
        // 📌 Diferenciar errores de validación y errores internos
        if (error.code === '23505') { // Código de error de duplicado en PostgreSQL
            return res.status(409).json({ message: "❌ La activación ya existe." });
        }

        res.status(500).json({ message: "❌ Error interno al registrar activación", error: error.message });
    }
});

module.exports = router;
