const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado. No hay token." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario_id = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};

module.exports = verificarToken;
