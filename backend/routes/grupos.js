const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { crearGrupo, obtenerGrupos, obtenerGrupoPorId, actualizarGrupo, eliminarGrupo, eliminarParticipante, obtenerParticipantes, unirseAlGrupo } = require('../controllers/gruposController');

//<summary>
// Rutas para la gestión de grupos
// Logica en controllers/gruposController.js
// (Rutas del API)
//</summary>

// ruta /api/grupos

// /api/grupos/crear
router.post('/crear', auth.verificarToken, crearGrupo);

// /api/grupos/
router.get('/mostrar', auth.verificarToken, obtenerGrupos);

// /api/grupos/:id
router.get('/:id', auth.verificarToken, obtenerGrupoPorId);

// /api/grupos/actualizar/:id
router.put('/actualizar/:id', auth.verificarToken, actualizarGrupo);

// /api/grupos/eliminar/:id
router.delete('/eliminar/:id', auth.verificarToken, eliminarGrupo);

// /api/grupos/:id
router.put('/:id', auth.verificarToken, actualizarGrupo);

// /api/grupos/:id
router.delete('/:id', auth.verificarToken, eliminarGrupo);

// /api/grupos/:id_grupo/participantes/:id_usuario_eliminar
router.delete('/:id_grupo/participantes/:id_usuario_eliminar', auth.verificarToken, eliminarParticipante);

// /api/grupos/:id/participantes
router.get('/:id/participantes', auth.verificarToken, obtenerParticipantes);

// /api/grupos/unirse
router.post('/unirse', auth.verificarToken, unirseAlGrupo);

module.exports = router;