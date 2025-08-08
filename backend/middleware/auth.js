const jwt = require('jsonwebtoken');

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token malformado.' });
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