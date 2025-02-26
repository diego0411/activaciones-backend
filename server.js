const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Permitir solicitudes desde cualquier origen
app.use(express.json()); // Permitir lectura de cuerpos JSON

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1); // Salir del proceso si no se puede conectar
  });

// Esquema de datos del usuario
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Masculino', 'Femenino', 'Otro'], required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  heartRate: { type: Number, required: false },
  temperature: { type: Number, required: false },
  oxygen: { type: Number, required: false },
  heartRateMin: { type: Number, required: false },
  heartRateMax: { type: Number, required: false },
  temperatureMin: { type: Number, required: false },
  temperatureMax: { type: Number, required: false },
  oxygenMin: { type: Number, required: false },
  oxygenMax: { type: Number, required: false },
}, { timestamps: true }); // Agrega campos de fecha de creación y actualización automáticamente

const User = mongoose.model('User', userSchema);

// Rutas para manejar usuarios

// Crear un nuevo usuario
app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'Usuario creado exitosamente', user });
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    res.status(400).json({ message: 'Error al guardar usuario', error });
  }
});

// Obtener todos los usuarios
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios', error });
  }
});

// Obtener un usuario por ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al obtener usuario', error });
  }
});

// Actualizar un usuario por ID
app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json({ message: 'Usuario actualizado exitosamente', user });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(400).json({ message: 'Error al actualizar usuario', error });
  }
});

// Eliminar un usuario por ID
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario', error });
  }
});

// Puerto de la aplicación
const PORT = process.env.PORT || 5001;

// Verificar si el puerto ya está en uso
app.listen(PORT, (err) => {
  if (err) {
    console.error(`Error al iniciar el servidor en el puerto ${PORT}:`, err);
    process.exit(1);
  }
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
