const jwt = require('jsonwebtoken');
require('dotenv').config(); 

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
    // Intentar obtener el token del header Authorization
    let token = null;
    const authHeader = req.headers['authorization'];
    
    if (authHeader) {
        token = authHeader.split(' ')[1];
    }
    
    // Si no está en el header, intentar obtener del query parameter (para SSE)
    if (!token) {
        token = req.query.token;
    }
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'split-ease-secret');
        req.usuario = decoded; // decoded contiene { id, nombre, email }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido.' });
    }
};

module.exports = { verificarToken };