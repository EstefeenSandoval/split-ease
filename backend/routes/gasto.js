const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  obtenerCategorias, 
  crearCategoria, 
  crearGasto, 
  obtenerGastosPorGrupo, 
  obtenerDetalleGasto, 
  actualizarGasto, 
  eliminarGasto, 
  marcarComoPagado 
} = require('../controllers/gastoController');

//<summary>
// Rutas para la gestión de gastos y categorías
// Logica en controllers/gastoController.js
// (Rutas del API)
//</summary>

// ruta /api/gastos

// =========== CATEGORÍAS ===========

// /api/gastos/categorias - Obtener todas las categorías
router.get('/categorias', auth.verificarToken, obtenerCategorias);

// /api/gastos/categorias - Crear nueva categoría
router.post('/categorias', auth.verificarToken, crearCategoria);

// =========== GASTOS ===========

// /api/gastos - Crear nuevo gasto
router.post('/', auth.verificarToken, crearGasto);

// /api/gastos/grupo/:id_grupo - Obtener gastos de un grupo específico
router.get('/grupo/:id_grupo', auth.verificarToken, obtenerGastosPorGrupo);

// /api/gastos/:id_gasto - Obtener detalle de un gasto específico
router.get('/:id_gasto', auth.verificarToken, obtenerDetalleGasto);

// /api/gastos/:id_gasto - Actualizar un gasto
router.put('/:id_gasto', auth.verificarToken, actualizarGasto);

// /api/gastos/:id_gasto - Eliminar un gasto
router.delete('/:id_gasto', auth.verificarToken, eliminarGasto);

// /api/gastos/:id_gasto/pagar - Marcar división como pagada
router.put('/:id_gasto/pagar', auth.verificarToken, marcarComoPagado);

module.exports = router;
