const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Encabezado Authorization
    // Indicamos Formato "Bearer <TOKEN>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No se proporcionó un token' });
    }

    // Verificar el token con la clave secreta
    jwt.verify(token, process.env.secret_key, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }

        req.user = decoded; // Información del token decodificada
        next(); // Pasar al siguiente middleware o controlador
    });
};