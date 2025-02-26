const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // Verifica si hay un token en los headers
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado. No hay token." });
    }

    try {
        // Verifica y decodifica el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario_id = decoded.id; // Extrae el ID del usuario autenticado
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};

module.exports = verificarToken;
