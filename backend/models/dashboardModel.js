const db = require('../config/db');

// <summary>
// Modelo para el dashboard y estadísticas del usuario
// (Interacción con la base de datos de la API)
//</summary>

// =========== KPIs ===========

const obtenerKPIs = (id_usuario, callback) => {
  const query = `
    SELECT 
      -- Balance General: Lo que te deben - Lo que debes
      COALESCE(SUM(CASE 
        WHEN g.id_pagador = ? AND dg.id_usuario != ? AND dg.pagado = 0 
        THEN dg.monto_asignado 
        ELSE 0 
      END), 0) - 
      COALESCE(SUM(CASE 
        WHEN dg.id_usuario = ? AND g.id_pagador != ? AND dg.pagado = 0 
        THEN dg.monto_asignado 
        ELSE 0 
      END), 0) AS balanceGeneral,
      
      -- Total que te deben (eres el pagador y otros no han pagado)
      COALESCE(SUM(CASE 
        WHEN g.id_pagador = ? AND dg.id_usuario != ? AND dg.pagado = 0 
        THEN dg.monto_asignado 
        ELSE 0 
      END), 0) AS totalTeDeben,
      
      -- Total que debes (otros son pagadores y tú no has pagado)
      COALESCE(SUM(CASE 
        WHEN dg.id_usuario = ? AND g.id_pagador != ? AND dg.pagado = 0 
        THEN dg.monto_asignado 
        ELSE 0 
      END), 0) AS totalQueDebes,
      
      -- Gastos totales del mes actual donde participas
      COALESCE(SUM(CASE 
        WHEN MONTH(g.fecha_gasto) = MONTH(CURRENT_DATE) 
        AND YEAR(g.fecha_gasto) = YEAR(CURRENT_DATE)
        AND dg.id_usuario = ?
        THEN dg.monto_asignado 
        ELSE 0 
      END), 0) AS gastosTotalesMesActual
      
    FROM DIVISIONES_GASTO dg
    INNER JOIN GASTOS g ON dg.id_gasto = g.id_gasto
    WHERE (g.id_pagador = ? OR dg.id_usuario = ?)
    AND g.estado != 'cancelado'
  `;
  
  db.query(query, [
    id_usuario, id_usuario, id_usuario, id_usuario, // balanceGeneral
    id_usuario, id_usuario, // totalTeDeben
    id_usuario, id_usuario, // totalQueDebes
    id_usuario, // gastosTotalesMesActual
    id_usuario, id_usuario // WHERE
  ], (err, results) => {
    if (err) return callback(err);
    
    const kpis = results[0] || {
      balanceGeneral: 0,
      totalTeDeben: 0,
      totalQueDebes: 0,
      gastosTotalesMesActual: 0
    };
    
    // Convertir a números con 2 decimales
    callback(null, {
      balanceGeneral: parseFloat(kpis.balanceGeneral).toFixed(2),
      totalTeDeben: parseFloat(kpis.totalTeDeben).toFixed(2),
      totalQueDebes: parseFloat(kpis.totalQueDebes).toFixed(2),
      gastosTotalesMesActual: parseFloat(kpis.gastosTotalesMesActual).toFixed(2)
    });
  });
};

// =========== GRÁFICOS ===========

const obtenerGastosPorCategoria = (id_usuario, callback) => {
  const query = `
    SELECT 
      c.nombre,
      SUM(dg.monto_asignado) AS total
    FROM DIVISIONES_GASTO dg
    INNER JOIN GASTOS g ON dg.id_gasto = g.id_gasto
    LEFT JOIN CATEGORIAS c ON g.id_categoria = c.id_categoria
    WHERE dg.id_usuario = ?
    AND g.estado != 'cancelado'
    AND MONTH(g.fecha_gasto) = MONTH(CURRENT_DATE)
    AND YEAR(g.fecha_gasto) = YEAR(CURRENT_DATE)
    GROUP BY c.id_categoria, c.nombre
    HAVING total > 0
    ORDER BY total DESC
  `;
  
  db.query(query, [id_usuario], (err, results) => {
    if (err) return callback(err);
    
    // Calcular el total general para los porcentajes
    const totalGeneral = results.reduce((sum, item) => sum + parseFloat(item.total), 0);
    
    // Agregar porcentajes
    const gastosPorCategoria = results.map(item => ({
      nombre: item.nombre || 'Sin categoría',
      total: parseFloat(item.total).toFixed(2),
      porcentaje: totalGeneral > 0 ? ((item.total / totalGeneral) * 100).toFixed(1) : 0
    }));
    
    callback(null, gastosPorCategoria);
  });
};

const obtenerEvolucionGastos = (id_usuario, callback) => {
  const query = `
    SELECT 
      DATE_FORMAT(g.fecha_gasto, '%Y-%m') AS mes,
      SUM(dg.monto_asignado) AS total
    FROM DIVISIONES_GASTO dg
    INNER JOIN GASTOS g ON dg.id_gasto = g.id_gasto
    WHERE dg.id_usuario = ?
    AND g.estado != 'cancelado'
    AND g.fecha_gasto >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
    GROUP BY DATE_FORMAT(g.fecha_gasto, '%Y-%m')
    ORDER BY mes ASC
  `;
  
  db.query(query, [id_usuario], (err, results) => {
    if (err) return callback(err);
    
    // Formatear los nombres de los meses
    const mesesNombres = {
      '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
      '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
      '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
    };
    
    const evolucionGastos = results.map(item => {
      const [anio, mes] = item.mes.split('-');
      return {
        mes: mesesNombres[mes] || mes,
        total: parseFloat(item.total).toFixed(2)
      };
    });
    
    callback(null, evolucionGastos);
  });
};

// =========== LISTAS ===========

const obtenerCobrosPendientes = (id_usuario, callback) => {
  const query = `
    SELECT 
      dg.id_usuario AS idUsuarioDeudor,
      u.nombre AS nombreDeudor,
      u.foto_perfil AS fotoPerfil,
      dg.monto_asignado AS montoTotal,
      dg.monto_pagado AS montoPagado,
      (dg.monto_asignado - dg.monto_pagado) AS monto,
      g.id_gasto AS idGasto,
      g.descripcion AS descripcionGasto
    FROM DIVISIONES_GASTO dg
    INNER JOIN GASTOS g ON dg.id_gasto = g.id_gasto
    INNER JOIN USUARIOS u ON dg.id_usuario = u.id_usuario
    WHERE g.id_pagador = ?
    AND dg.id_usuario != ?
    AND dg.pagado = 0
    AND (dg.monto_asignado - dg.monto_pagado) > 0.01
    AND g.estado != 'cancelado'
    ORDER BY g.fecha_gasto DESC
  `;
  
  db.query(query, [id_usuario, id_usuario], (err, results) => {
    if (err) return callback(err);
    
    const cobros = results.map(item => ({
      idUsuarioDeudor: item.idUsuarioDeudor,
      nombreDeudor: item.nombreDeudor,
      fotoPerfil: item.fotoPerfil || null,
      monto: parseFloat(item.monto).toFixed(2),
      montoTotal: parseFloat(item.montoTotal).toFixed(2),
      montoPagado: parseFloat(item.montoPagado).toFixed(2),
      idGasto: item.idGasto,
      descripcionGasto: item.descripcionGasto || 'Sin descripción'
    }));
    
    callback(null, cobros);
  });
};

const obtenerDeudasPendientes = (id_usuario, callback) => {
  const query = `
    SELECT 
      g.id_pagador AS idUsuarioAcreedor,
      u.nombre AS nombreAcreedor,
      u.foto_perfil AS fotoPerfil,
      dg.monto_asignado AS montoTotal,
      dg.monto_pagado AS montoPagado,
      (dg.monto_asignado - dg.monto_pagado) AS monto,
      g.id_gasto AS idGasto,
      g.descripcion AS descripcionGasto
    FROM DIVISIONES_GASTO dg
    INNER JOIN GASTOS g ON dg.id_gasto = g.id_gasto
    INNER JOIN USUARIOS u ON g.id_pagador = u.id_usuario
    WHERE dg.id_usuario = ?
    AND g.id_pagador != ?
    AND dg.pagado = 0
    AND (dg.monto_asignado - dg.monto_pagado) > 0.01
    AND g.estado != 'cancelado'
    ORDER BY g.fecha_gasto DESC
  `;
  
  db.query(query, [id_usuario, id_usuario], (err, results) => {
    if (err) return callback(err);
    
    const deudas = results.map(item => ({
      idUsuarioAcreedor: item.idUsuarioAcreedor,
      nombreAcreedor: item.nombreAcreedor,
      fotoPerfil: item.fotoPerfil || null,
      monto: parseFloat(item.monto).toFixed(2),
      montoTotal: parseFloat(item.montoTotal).toFixed(2),
      montoPagado: parseFloat(item.montoPagado).toFixed(2),
      idGasto: item.idGasto,
      descripcionGasto: item.descripcionGasto || 'Sin descripción'
    }));
    
    callback(null, deudas);
  });
};

// =========== ACTIVIDAD ===========

const obtenerActividadReciente = (id_usuario, limite, callback) => {
  const query = `
    SELECT 
      tipo_notificacion AS tipo,
      mensaje,
      fecha_envio AS fecha,
      NULL AS monto
    FROM NOTIFICACIONES
    WHERE id_usuario = ?
    ORDER BY fecha_envio DESC
    LIMIT ?
  `;
  
  db.query(query, [id_usuario, limite], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

const obtenerActividadPaginada = (id_usuario, limite, offset, callback) => {
  const query = `
    SELECT 
      tipo_notificacion AS tipo,
      mensaje,
      fecha_envio AS fecha,
      url_destino,
      leida
    FROM NOTIFICACIONES
    WHERE id_usuario = ?
    ORDER BY fecha_envio DESC
    LIMIT ? OFFSET ?
  `;
  
  db.query(query, [id_usuario, limite, offset], callback);
};

const contarActividadTotal = (id_usuario, callback) => {
  const query = `
    SELECT COUNT(*) AS total
    FROM NOTIFICACIONES
    WHERE id_usuario = ?
  `;
  
  db.query(query, [id_usuario], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0].total);
  });
};

// =========== PAGOS ===========

const verificarDivisionGasto = (id_gasto, id_usuario, callback) => {
  const query = `
    SELECT 
      id_gasto,
      id_usuario,
      monto_asignado,
      monto_pagado,
      (monto_asignado - monto_pagado) AS saldo_pendiente,
      pagado
    FROM DIVISIONES_GASTO
    WHERE id_gasto = ? AND id_usuario = ?
  `;
  
  db.query(query, [id_gasto, id_usuario], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0] || null);
  });
};

const obtenerInfoGasto = (id_gasto, callback) => {
  const query = `
    SELECT 
      id_gasto,
      id_grupo,
      descripcion
    FROM GASTOS
    WHERE id_gasto = ?
  `;
  
  db.query(query, [id_gasto], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0] || null);
  });
};

const crearPago = (id_usuario_pagador, id_usuario_receptor, id_grupo, id_gasto, monto, descripcion, tipo_pago, monto_total_deuda, saldo_restante, callback) => {
  const query = `
    INSERT INTO PAGOS (
      id_usuario_pagador, 
      id_usuario_receptor, 
      id_grupo, 
      id_gasto, 
      monto, 
      descripcion,
      tipo_pago,
      monto_total_deuda,
      saldo_restante
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [
    id_usuario_pagador, 
    id_usuario_receptor, 
    id_grupo, 
    id_gasto, 
    monto, 
    descripcion,
    tipo_pago,
    monto_total_deuda,
    saldo_restante
  ], callback);
};

const registrarPagoParcial = (id_gasto, id_usuario, monto_pago, callback) => {
  const query = `
    UPDATE DIVISIONES_GASTO 
    SET monto_pagado = monto_pagado + ?
    WHERE id_gasto = ? AND id_usuario = ?
  `;
  
  db.query(query, [monto_pago, id_gasto, id_usuario], callback);
};

// Mantener función original para compatibilidad
const marcarDivisionComoPagada = (id_gasto, id_usuario, callback) => {
  const query = `
    UPDATE DIVISIONES_GASTO 
    SET pagado = 1, fecha_pago = CURRENT_TIMESTAMP 
    WHERE id_gasto = ? AND id_usuario = ?
  `;
  
  db.query(query, [id_gasto, id_usuario], callback);
};

// =========== HISTORIAL DE PAGOS ===========

const obtenerHistorialPagosGasto = (id_gasto, id_usuario, callback) => {
  const query = `
    SELECT 
      p.id_pago,
      p.monto,
      p.tipo_pago,
      p.monto_total_deuda,
      p.saldo_restante,
      p.descripcion,
      p.fecha_pago,
      u_receptor.nombre AS nombreReceptor,
      u_receptor.foto_perfil AS fotoReceptor,
      u_pagador.nombre AS nombrePagador,
      u_pagador.foto_perfil AS fotoPagador
    FROM PAGOS p
    INNER JOIN USUARIOS u_receptor ON p.id_usuario_receptor = u_receptor.id_usuario
    INNER JOIN USUARIOS u_pagador ON p.id_usuario_pagador = u_pagador.id_usuario
    WHERE p.id_gasto = ?
    AND (p.id_usuario_pagador = ? OR p.id_usuario_receptor = ?)
    ORDER BY p.fecha_pago DESC
  `;
  
  db.query(query, [id_gasto, id_usuario, id_usuario], (err, results) => {
    if (err) return callback(err);
    
    const pagos = results.map(item => ({
      idPago: item.id_pago,
      monto: parseFloat(item.monto).toFixed(2),
      tipoPago: item.tipo_pago,
      montoTotalDeuda: parseFloat(item.monto_total_deuda).toFixed(2),
      saldoRestante: parseFloat(item.saldo_restante).toFixed(2),
      descripcion: item.descripcion,
      fecha: item.fecha_pago,
      nombreReceptor: item.nombreReceptor,
      fotoReceptor: item.fotoReceptor || null,
      nombrePagador: item.nombrePagador,
      fotoPagador: item.fotoPagador || null
    }));
    
    callback(null, pagos);
  });
};

// =========== NOTIFICACIONES ===========

const crearNotificacion = (id_usuario, tipo_notificacion, mensaje, url_destino, callback) => {
  const query = `
    INSERT INTO NOTIFICACIONES (id_usuario, tipo_notificacion, mensaje, url_destino)
    VALUES (?, ?, ?, ?)
  `;
  
  db.query(query, [id_usuario, tipo_notificacion, mensaje, url_destino], callback);
};

module.exports = {
  // KPIs
  obtenerKPIs,
  
  // Gráficos
  obtenerGastosPorCategoria,
  obtenerEvolucionGastos,
  
  // Listas
  obtenerCobrosPendientes,
  obtenerDeudasPendientes,
  
  // Actividad
  obtenerActividadReciente,
  obtenerActividadPaginada,
  contarActividadTotal,
  
  // Pagos
  verificarDivisionGasto,
  obtenerInfoGasto,
  crearPago,
  registrarPagoParcial,
  marcarDivisionComoPagada,
  obtenerHistorialPagosGasto,
  
  // Notificaciones
  crearNotificacion
};