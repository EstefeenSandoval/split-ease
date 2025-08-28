const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { mostrarTodos, registrar, login, validar, actualizarPerfil} = require('../controllers/usuarioController');

//<summary>
// Rutas para la gestión de usuarios
// Logica en controllers/usuarioController.js
// (Rutas del API)
//</summary>

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

// /api/usuarios/perfil
router.put(
  '/perfil', 
  auth.verificarToken, 
  upload.single('foto_perfil'), 
  actualizarPerfil
);

module.exports = router;