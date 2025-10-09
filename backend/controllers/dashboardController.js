const dashboardModel = require('../models/dashboardModel');

// <summary>
// Controlador para el dashboard y estadísticas del usuario
// Manejo de base de datos en models/dashboardModel.js
// (Logica de la API)
//</summary>

// =========== DASHBOARD PRINCIPAL ===========

// Obtener resumen completo del dashboard personal
const obtenerDashboardPersonal = (req, res) => {
  const id_usuario = req.usuario.id_usuario;
  
  // Objeto para almacenar todos los datos del dashboard
  const dashboardData = {
    kpis: {},
    graficos: {
      gastosPorCategoria: [],
      evolucionGastos: []
    },
    listas: {
      cobrosPendientes: [],
      deudasPendientes: []
    },
    actividadReciente: []
  };
  
  // Contador de callbacks completados
  let completados = 0;
  const totalCallbacks = 6;
  let errorOcurrido = false;
  
  // Función para verificar si todos los callbacks han terminado
  const verificarCompletado = () => {
    completados++;
    if (completados === totalCallbacks && !errorOcurrido) {
      res.status(200).json({
        mensaje: 'Dashboard obtenido correctamente.',
        ...dashboardData
      });
    }
  };
  
  // 1. Obtener KPIs (balance general, total te deben, total debes, gastos mes actual)
  dashboardModel.obtenerKPIs(id_usuario, (err, kpis) => {
    if (err && !errorOcurrido) {
      errorOcurrido = true;
      console.error('Error al obtener KPIs:', err);
      return res.status(500).json({ error: 'Error al obtener estadísticas generales.' });
    }
    dashboardData.kpis = kpis;
    verificarCompletado();
  });
  
  // 2. Obtener gastos por categoría
  dashboardModel.obtenerGastosPorCategoria(id_usuario, (err, gastosPorCategoria) => {
    if (err && !errorOcurrido) {
      errorOcurrido = true;
      console.error('Error al obtener gastos por categoría:', err);
      return res.status(500).json({ error: 'Error al obtener gastos por categoría.' });
    }
    dashboardData.graficos.gastosPorCategoria = gastosPorCategoria;
    verificarCompletado();
  });
  
  // 3. Obtener evolución de gastos (últimos 3 meses)
  dashboardModel.obtenerEvolucionGastos(id_usuario, (err, evolucionGastos) => {
    if (err && !errorOcurrido) {
      errorOcurrido = true;
      console.error('Error al obtener evolución de gastos:', err);
      return res.status(500).json({ error: 'Error al obtener evolución de gastos.' });
    }
    dashboardData.graficos.evolucionGastos = evolucionGastos;
    verificarCompletado();
  });
  
  // 4. Obtener cobros pendientes (quién te debe)
  dashboardModel.obtenerCobrosPendientes(id_usuario, (err, cobros) => {
    if (err && !errorOcurrido) {
      errorOcurrido = true;
      console.error('Error al obtener cobros pendientes:', err);
      return res.status(500).json({ error: 'Error al obtener cobros pendientes.' });
    }
    dashboardData.listas.cobrosPendientes = cobros;
    verificarCompletado();
  });
  
  // 5. Obtener deudas pendientes (a quién debes)
  dashboardModel.obtenerDeudasPendientes(id_usuario, (err, deudas) => {
    if (err && !errorOcurrido) {
      errorOcurrido = true;
      console.error('Error al obtener deudas pendientes:', err);
      return res.status(500).json({ error: 'Error al obtener deudas pendientes.' });
    }
    dashboardData.listas.deudasPendientes = deudas;
    verificarCompletado();
  });
  
  // 6. Obtener actividad reciente (últimos 10 eventos)
  dashboardModel.obtenerActividadReciente(id_usuario, 10, (err, actividad) => {
    if (err && !errorOcurrido) {
      errorOcurrido = true;
      console.error('Error al obtener actividad reciente:', err);
      return res.status(500).json({ error: 'Error al obtener actividad reciente.' });
    }
    dashboardData.actividadReciente = actividad;
    verificarCompletado();
  });
};

// =========== ACTIVIDAD ===========

// Obtener historial paginado de actividad
const obtenerActividadPaginada = (req, res) => {
  const id_usuario = req.usuario.id_usuario;
  const pagina = parseInt(req.query.pagina) || 1;
  const limite = parseInt(req.query.limite) || 20;
  
  // Validación de parámetros
  if (pagina < 1 || limite < 1 || limite > 100) {
    return res.status(400).json({ error: 'Parámetros de paginación inválidos.' });
  }
  
  const offset = (pagina - 1) * limite;
  
  // Obtener actividad paginada
  dashboardModel.obtenerActividadPaginada(id_usuario, limite, offset, (err, actividad) => {
    if (err) {
      console.error('Error al obtener actividad paginada:', err);
      return res.status(500).json({ error: 'Error al obtener actividad.' });
    }
    
    // Obtener total de registros para calcular páginas
    dashboardModel.contarActividadTotal(id_usuario, (err, total) => {
      if (err) {
        console.error('Error al contar actividad:', err);
        return res.status(500).json({ error: 'Error al obtener actividad.' });
      }
      
      const totalPaginas = Math.ceil(total / limite);
      
      res.status(200).json({
        mensaje: 'Actividad obtenida correctamente.',
        actividad: actividad,
        paginacion: {
          paginaActual: pagina,
          limite: limite,
          totalRegistros: total,
          totalPaginas: totalPaginas
        }
      });
    });
  });
};

// =========== PAGOS ===========

// Registrar un pago para saldar una deuda (permite pagos parciales)
const saldarDeuda = (req, res) => {
  const id_usuario_pagador = req.usuario.id_usuario;
  const { idGasto, idUsuarioAcreedor, monto, metodo } = req.body;
  
  // Validaciones
  if (!idGasto || !idUsuarioAcreedor || !monto) {
    return res.status(400).json({ error: 'Gasto, usuario acreedor y monto son obligatorios.' });
  }
  
  if (isNaN(monto) || parseFloat(monto) <= 0) {
    return res.status(400).json({ error: 'El monto debe ser un número positivo.' });
  }
  
  const sanitizedMonto = parseFloat(monto);
  const sanitizedIdGasto = parseInt(idGasto);
  const sanitizedIdUsuarioAcreedor = parseInt(idUsuarioAcreedor);
  const sanitizedMetodo = metodo ? String(metodo).trim() : 'Manual';
  
  // Verificar que la división existe y pertenece al usuario
  dashboardModel.verificarDivisionGasto(sanitizedIdGasto, id_usuario_pagador, (err, division) => {
    if (err) {
      console.error('Error al verificar división:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
    
    if (!division) {
      return res.status(404).json({ error: 'División de gasto no encontrada.' });
    }
    
    // Verificar que no esté completamente pagado
    if (division.pagado === 1 || division.saldo_pendiente <= 0) {
      return res.status(400).json({ error: 'Esta deuda ya ha sido pagada completamente.' });
    }
    
    // Verificar que el monto no exceda el saldo pendiente
    if (sanitizedMonto > parseFloat(division.saldo_pendiente) + 0.01) {
      return res.status(400).json({ 
        error: 'El monto excede el saldo pendiente.',
        saldoPendiente: parseFloat(division.saldo_pendiente).toFixed(2)
      });
    }
    
    // Obtener información del gasto para saber el grupo
    dashboardModel.obtenerInfoGasto(sanitizedIdGasto, (err, gasto) => {
      if (err) {
        console.error('Error al obtener info del gasto:', err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
      }
      
      if (!gasto) {
        return res.status(404).json({ error: 'Gasto no encontrado.' });
      }
      
      const id_grupo = gasto.id_grupo;
      
      // Calcular si es pago completo o parcial
      const nuevoSaldoPendiente = parseFloat(division.saldo_pendiente) - sanitizedMonto;
      const esPagoCompleto = nuevoSaldoPendiente <= 0.01;
      const tipoPago = esPagoCompleto ? 'completo' : 'parcial';
      const montoTotalDeuda = parseFloat(division.monto_asignado);
      
      // Crear descripción más informativa
      let descripcion;
      if (esPagoCompleto) {
        descripcion = `Pago completo - ${gasto.descripcion || 'Gasto'} (Deuda saldada: $${montoTotalDeuda.toFixed(2)})`;
      } else {
        const montoPagadoAntes = parseFloat(division.monto_pagado || 0);
        const porcentajePagado = ((montoPagadoAntes + sanitizedMonto) / montoTotalDeuda * 100).toFixed(1);
        descripcion = `Pago parcial - ${gasto.descripcion || 'Gasto'} (${porcentajePagado}% pagado, resta: $${nuevoSaldoPendiente.toFixed(2)})`;
      }
      
      // Registrar el pago
      dashboardModel.crearPago(
        id_usuario_pagador,
        sanitizedIdUsuarioAcreedor,
        id_grupo,
        sanitizedIdGasto,
        sanitizedMonto,
        descripcion,
        tipoPago,
        montoTotalDeuda,
        Math.max(0, nuevoSaldoPendiente),
        (err, result) => {
          if (err) {
            console.error('Error al crear pago:', err);
            return res.status(500).json({ error: 'Error al registrar el pago.' });
          }
          
          const id_pago = result.insertId;
          
          // Registrar el pago parcial (incrementa monto_pagado)
          dashboardModel.registrarPagoParcial(sanitizedIdGasto, id_usuario_pagador, sanitizedMonto, (err) => {
            if (err) {
              console.error('Error al registrar pago parcial:', err);
              return res.status(500).json({ error: 'Error al actualizar el estado de la deuda.' });
            }
            
            // Si es pago completo, marcar la división como pagada
            if (esPagoCompleto) {
              dashboardModel.marcarDivisionComoPagada(sanitizedIdGasto, id_usuario_pagador, (err) => {
                if (err) {
                  console.error('Error al marcar división como pagada:', err);
                  // No devolver error, ya se registró el pago
                }
              });
            }
            
            // Crear notificación para el acreedor
            const tipoMensaje = esPagoCompleto ? 'completo' : 'parcial';
            const mensajeNotificacion = esPagoCompleto 
              ? `Has recibido un pago completo de $${sanitizedMonto.toFixed(2)} por "${gasto.descripcion || 'Gasto'}". Deuda saldada.`
              : `Has recibido un pago parcial de $${sanitizedMonto.toFixed(2)} por "${gasto.descripcion || 'Gasto'}". Saldo pendiente: $${nuevoSaldoPendiente.toFixed(2)}`;
            
            dashboardModel.crearNotificacion(
              sanitizedIdUsuarioAcreedor,
              'PAGO_REALIZADO',
              mensajeNotificacion,
              `/pagos/${id_pago}`,
              (err) => {
                if (err) {
                  console.error('Error al crear notificación:', err);
                  // No devolver error, la notificación es secundaria
                }
                
                res.status(201).json({
                  mensaje: esPagoCompleto 
                    ? 'Pago completo registrado correctamente. Deuda saldada.' 
                    : 'Pago parcial registrado correctamente.',
                  id_pago: id_pago,
                  monto: sanitizedMonto,
                  metodo: sanitizedMetodo,
                  saldoPendiente: nuevoSaldoPendiente.toFixed(2),
                  pagoCompleto: esPagoCompleto
                });
              }
            );
            
          });
        }
      );
    });
  });
};

// =========== HISTORIAL DE PAGOS ===========

// Obtener historial de pagos de un gasto específico
const obtenerHistorialPagos = (req, res) => {
  const id_usuario = req.usuario.id_usuario;
  const id_gasto = parseInt(req.params.id_gasto);
  
  if (!id_gasto || isNaN(id_gasto)) {
    return res.status(400).json({ error: 'ID de gasto inválido.' });
  }
  
  // Obtener historial de pagos
  dashboardModel.obtenerHistorialPagosGasto(id_gasto, id_usuario, (err, pagos) => {
    if (err) {
      console.error('Error al obtener historial de pagos:', err);
      return res.status(500).json({ error: 'Error al obtener historial de pagos.' });
    }
    
    res.status(200).json({
      mensaje: 'Historial de pagos obtenido correctamente.',
      idGasto: id_gasto,
      totalPagos: pagos.length,
      pagos: pagos
    });
  });
};

module.exports = {
  obtenerDashboardPersonal,
  obtenerActividadPaginada,
  saldarDeuda,
  obtenerHistorialPagos
};