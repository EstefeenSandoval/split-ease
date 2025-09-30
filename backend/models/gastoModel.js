const db = require('../config/db');

// <summary>
// Modelo para la gestión de gastos y categorías
// (Interacción con la base de datos de la API)
//</summary>

// =========== CATEGORÍAS ===========

const obtenerCategorias = (callback) => {
  db.query('SELECT * FROM CATEGORIAS ORDER BY nombre ASC', callback);
};

const crearCategoria = (nombre, descripcion, callback) => {
  db.query(
    'INSERT INTO CATEGORIAS (nombre, descripcion) VALUES (?, ?)',
    [nombre, descripcion || null],
    callback
  );
};

const buscarCategoriaPorId = (id_categoria, callback) => {
  db.query(
    'SELECT * FROM CATEGORIAS WHERE id_categoria = ?',
    [id_categoria],
    callback
  );
};

// =========== GASTOS ===========

const crearGasto = (id_grupo, id_pagador, descripcion, monto_total, id_categoria, fecha_gasto, moneda, callback) => {
  db.query(
    'INSERT INTO GASTOS (id_grupo, id_pagador, descripcion, monto_total, id_categoria, fecha_gasto, moneda) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id_grupo, id_pagador, descripcion, monto_total, id_categoria || null, fecha_gasto, moneda || 'MXN'],
    callback
  );
};

const obtenerGastosPorGrupo = (id_grupo, callback) => {
  const query = `
    SELECT 
      g.id_gasto,
      g.descripcion,
      g.monto_total,
      g.fecha_gasto,
      g.fecha_registro,
      g.estado,
      g.moneda,
      u.nombre as nombre_pagador,
      u.id_usuario as id_pagador,
      c.nombre as categoria,
      c.id_categoria
    FROM GASTOS g
    LEFT JOIN USUARIOS u ON g.id_pagador = u.id_usuario
    LEFT JOIN CATEGORIAS c ON g.id_categoria = c.id_categoria
    WHERE g.id_grupo = ?
    ORDER BY g.fecha_gasto DESC
  `;
  
  db.query(query, [id_grupo], callback);
};

const obtenerGastoPorId = (id_gasto, callback) => {
  const query = `
    SELECT 
      g.id_gasto,
      g.id_grupo,
      g.descripcion,
      g.monto_total,
      g.fecha_gasto,
      g.fecha_registro,
      g.estado,
      g.moneda,
      u.nombre as nombre_pagador,
      u.id_usuario as id_pagador,
      c.nombre as categoria,
      c.id_categoria
    FROM GASTOS g
    LEFT JOIN USUARIOS u ON g.id_pagador = u.id_usuario
    LEFT JOIN CATEGORIAS c ON g.id_categoria = c.id_categoria
    WHERE g.id_gasto = ?
  `;
  
  db.query(query, [id_gasto], callback);
};

const actualizarGasto = (id_gasto, descripcion, monto_total, id_categoria, fecha_gasto, callback) => {
  db.query(
    'UPDATE GASTOS SET descripcion = ?, monto_total = ?, id_categoria = ?, fecha_gasto = ? WHERE id_gasto = ?',
    [descripcion, monto_total, id_categoria || null, fecha_gasto, id_gasto],
    callback
  );
};

const eliminarGasto = (id_gasto, callback) => {
  db.query('DELETE FROM GASTOS WHERE id_gasto = ?', [id_gasto], callback);
};

const actualizarEstadoGasto = (id_gasto, estado, callback) => {
  db.query(
    'UPDATE GASTOS SET estado = ? WHERE id_gasto = ?',
    [estado, id_gasto],
    callback
  );
};

// =========== DIVISIONES DE GASTO ===========

const crearDivisionGasto = (id_gasto, id_usuario, monto_asignado, tipo_division, callback) => {
  db.query(
    'INSERT INTO DIVISIONES_GASTO (id_gasto, id_usuario, monto_asignado, tipo_division) VALUES (?, ?, ?, ?)',
    [id_gasto, id_usuario, monto_asignado, tipo_division || 'equitativa'],
    callback
  );
};

const obtenerDivisionesPorGasto = (id_gasto, callback) => {
  const query = `
    SELECT 
      dg.id_gasto,
      dg.id_usuario,
      dg.monto_asignado,
      dg.pagado,
      dg.fecha_pago,
      dg.tipo_division,
      u.nombre as nombre_usuario
    FROM DIVISIONES_GASTO dg
    LEFT JOIN USUARIOS u ON dg.id_usuario = u.id_usuario
    WHERE dg.id_gasto = ?
    ORDER BY u.nombre ASC
  `;
  
  db.query(query, [id_gasto], callback);
};

const marcarDivisionComoPagada = (id_gasto, id_usuario, callback) => {
  db.query(
    'UPDATE DIVISIONES_GASTO SET pagado = 1, fecha_pago = CURRENT_TIMESTAMP WHERE id_gasto = ? AND id_usuario = ?',
    [id_gasto, id_usuario],
    callback
  );
};

const eliminarDivisionesPorGasto = (id_gasto, callback) => {
  db.query('DELETE FROM DIVISIONES_GASTO WHERE id_gasto = ?', [id_gasto], callback);
};

const actualizarDivisionGasto = (id_gasto, id_usuario, monto_asignado, callback) => {
  db.query(
    'UPDATE DIVISIONES_GASTO SET monto_asignado = ? WHERE id_gasto = ? AND id_usuario = ?',
    [monto_asignado, id_gasto, id_usuario],
    callback
  );
};

module.exports = {
  // Categorías
  obtenerCategorias,
  crearCategoria,
  buscarCategoriaPorId,
  
  // Gastos
  crearGasto,
  obtenerGastosPorGrupo,
  obtenerGastoPorId,
  actualizarGasto,
  eliminarGasto,
  actualizarEstadoGasto,
  
  // Divisiones
  crearDivisionGasto,
  obtenerDivisionesPorGasto,
  marcarDivisionComoPagada,
  eliminarDivisionesPorGasto,
  actualizarDivisionGasto
};
