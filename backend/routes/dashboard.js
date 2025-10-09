const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  obtenerDashboardPersonal,
  obtenerActividadPaginada,
  saldarDeuda,
  obtenerHistorialPagos
} = require('../controllers/dashboardController');

//<summary>
// Rutas para el dashboard y estadísticas del usuario
// Logica en controllers/dashboardController.js
// (Rutas del API)
//</summary>

// ruta /api/dashboard

// =========== DASHBOARD PRINCIPAL ===========

// /api/dashboard/personal - Obtener resumen completo del dashboard personal
router.get('/personal', auth.verificarToken, obtenerDashboardPersonal);

// =========== ACTIVIDAD ===========

// /api/dashboard/actividad - Obtener historial paginado de actividad
router.get('/actividad', auth.verificarToken, obtenerActividadPaginada);

// =========== PAGOS ===========

// /api/dashboard/pagos/saldar - Registrar un pago para saldar una deuda
router.post('/pagos/saldar', auth.verificarToken, saldarDeuda);

// /api/dashboard/pagos/historial/:id_gasto - Obtener historial de pagos de un gasto
router.get('/pagos/historial/:id_gasto', auth.verificarToken, obtenerHistorialPagos);

module.exports = router;