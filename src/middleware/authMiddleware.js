const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Verificar si hay encabezado de autorización
        if (!authHeader) {
            return res.status(401).json({ message: "Acceso denegado. No hay token." });
        }

        // Verificar que el esquema sea "Bearer"
        const tokenParts = authHeader.split(" ");
        if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
            return res.status(401).json({ message: "Formato de token inválido." });
        }

        const token = tokenParts[1];

        // Verificar el token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error("❌ Error al verificar el token:", err.message);

                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({ message: "El token ha expirado. Inicia sesión nuevamente." });
                } else if (err.name === "JsonWebTokenError") {
                    return res.status(401).json({ message: "Token inválido." });
                } else {
                    return res.status(500).json({ message: "Error en la autenticación." });
                }
            }

            // Agregar el usuario decodificado a la solicitud
            req.usuario_id = decoded.id;
            next();
        });
    } catch (error) {
        console.error("❌ Error en el middleware de autenticación:", error.message);
        return res.status(500).json({ message: "Error interno en la autenticación." });
    }
};

module.exports = verificarToken;
