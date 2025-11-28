const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { 
  mostrarTodos, 
  registrar, 
  login, 
  validar, 
  actualizarPerfil, 
  obtenerPerfil,
  verificarEmail,
  reenviarVerificacion,
  forgotPassword,
  resetPassword,
  validarTokenReset,
  verificarCambioPerfil
} = require('../controllers/usuarioController');

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

// /api/usuarios/perfil - Obtener perfil del usuario actual
router.get('/perfil', auth.verificarToken, obtenerPerfil);

// /api/usuarios/perfil - Actualizar perfil
router.put('/perfil', auth.verificarToken, upload.single('foto_perfil'), actualizarPerfil);

// =====================================================
// RUTAS DE VERIFICACIÓN DE EMAIL
// =====================================================

// /api/usuarios/verificar-email/:token - Verificar email con token
router.get('/verificar-email/:token', verificarEmail);

// /api/usuarios/reenviar-verificacion - Reenviar email de verificación
router.post('/reenviar-verificacion', reenviarVerificacion);

// =====================================================
// RUTAS DE RECUPERACIÓN DE CONTRASEÑA
// =====================================================

// /api/usuarios/forgot-password - Solicitar recuperación de contraseña
router.post('/forgot-password', forgotPassword);

// /api/usuarios/reset-password/:token - Validar token de reset (GET)
router.get('/reset-password/:token', validarTokenReset);

// /api/usuarios/reset-password/:token - Restablecer contraseña (POST)
router.post('/reset-password/:token', resetPassword);

// =====================================================
// RUTAS DE VERIFICACIÓN DE CAMBIOS DE PERFIL
// =====================================================

// /api/usuarios/verificar-cambio/:token - Verificar cambios de perfil
router.get('/verificar-cambio/:token', verificarCambioPerfil);

module.exports = router;