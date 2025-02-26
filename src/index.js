const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const activacionesRoutes = require('./routes/activacionesRoutes'); // 🔹 Importamos la ruta

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors());

// Rutas
app.use('/auth', authRoutes);
app.use('/uploads', uploadRoutes);
app.use('/activaciones', activacionesRoutes); // 🔹 Debe estar aquí

app.get('/', (req, res) => {
    res.send('API de Activaciones funcionando correctamente 🚀');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
