require('dotenv').config(); // Cargar variables de entorno antes de todo

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const activacionesRoutes = require('./routes/activacionesRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// 🔹 Configuración de CORS
const corsOptions = {
    origin: process.env.CLIENT_URL || '*', // Permitir solo el dominio configurado en .env
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// 🔹 Middlewares
app.use(express.json());

// 🔹 Rutas
app.use('/auth', authRoutes);
app.use('/uploads', uploadRoutes);
app.use('/activaciones', activacionesRoutes);

console.log('✅ Rutas cargadas correctamente');

// 🔹 Ruta principal
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API de Activaciones funcionando correctamente 🚀' });
});

// 🔹 Manejador de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: '❌ Ruta no encontrada' });
});

// 🔹 Manejador de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error en el servidor:', err);
    res.status(500).json({ error: '❌ Error interno del servidor', details: err.message });
});

// 🔹 Iniciar el servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
