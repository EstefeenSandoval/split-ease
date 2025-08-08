const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { mostrarTodos, registrar, login, validar} = require('../controllers/usuariosController');

// ruta /api/usuarios


// /api/usuarios/registro
router.post('/registro', registrar);

// /api/usuarios/login
router.post('/login', login);

// Proteger la ruta /mostrar con JWT
// /api/usuarios/mostrar
router.get('/mostrar', auth.verificarToken, mostrarTodos);

// /api/usuarios/validar
router.get('/validar', auth.verificarToken, validar);

module.exports = router;