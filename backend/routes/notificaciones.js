const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  crearNotificacion,
  obtenerNotificacionesUsuario,
  obtenerNotificacionesNoLeidas,
  obtenerNotificacionPorId,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  eliminarNotificacionesLeidas,
  contarNoLeidas,
  streamNotificaciones
} = require('../controllers/notificacionesController');

//<summary>
// Rutas para la gestión de notificaciones
// Lógica en controllers/notificacionesController.js
// (Rutas del API)
//</summary>

// ruta base: /api/notificaciones

// POST /api/notificaciones - Crear una nueva notificación
router.post('/', auth.verificarToken, crearNotificacion);

// GET /api/notificaciones/usuario/:id_usuario - Obtener todas las notificaciones de un usuario
router.get('/usuario/:id_usuario', auth.verificarToken, obtenerNotificacionesUsuario);

// GET /api/notificaciones/usuario/:id_usuario/no-leidas - Obtener notificaciones no leídas de un usuario
router.get('/usuario/:id_usuario/no-leidas', auth.verificarToken, obtenerNotificacionesNoLeidas);

// GET /api/notificaciones/usuario/:id_usuario/count - Contar notificaciones no leídas
router.get('/usuario/:id_usuario/count', auth.verificarToken, contarNoLeidas);

// GET /api/notificaciones/usuario/:id_usuario/stream - Server-Sent Events para notificaciones en tiempo real
router.get('/usuario/:id_usuario/stream', auth.verificarToken, streamNotificaciones);

// GET /api/notificaciones/:id_notificacion - Obtener una notificación específica
router.get('/:id_notificacion', auth.verificarToken, obtenerNotificacionPorId);

// PUT /api/notificaciones/:id_notificacion/marcar-leida - Marcar notificación como leída
router.put('/:id_notificacion/marcar-leida', auth.verificarToken, marcarComoLeida);

// PUT /api/notificaciones/usuario/:id_usuario/marcar-todas-leidas - Marcar todas las notificaciones como leídas
router.put('/usuario/:id_usuario/marcar-todas-leidas', auth.verificarToken, marcarTodasComoLeidas);

// DELETE /api/notificaciones/:id_notificacion - Eliminar una notificación específica
router.delete('/:id_notificacion', auth.verificarToken, eliminarNotificacion);

// DELETE /api/notificaciones/usuario/:id_usuario/eliminar-leidas - Eliminar todas las notificaciones leídas
router.delete('/usuario/:id_usuario/eliminar-leidas', auth.verificarToken, eliminarNotificacionesLeidas);

module.exports = router;
