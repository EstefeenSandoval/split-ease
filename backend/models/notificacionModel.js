const db = require('../config/db');

// <summary>
// Modelo para la gestión de notificaciones
// (Interacción con la base de datos de la API)
//</summary>

// Crear una nueva notificación
const crearNotificacion = (id_usuario, tipo_notificacion, mensaje, url_destino, callback) => {
  db.query(
    'INSERT INTO NOTIFICACIONES (id_usuario, tipo_notificacion, mensaje, url_destino) VALUES (?, ?, ?, ?)',
    [id_usuario, tipo_notificacion, mensaje, url_destino],
    callback
  );
};

// Obtener todas las notificaciones de un usuario (ordenadas por fecha_envio DESC)
const obtenerNotificacionesPorUsuario = (id_usuario, callback) => {
  db.query(
    `SELECT * FROM NOTIFICACIONES 
     WHERE id_usuario = ? 
     ORDER BY fecha_envio DESC`,
    [id_usuario],
    callback
  );
};

// Obtener solo las notificaciones no leídas de un usuario
const obtenerNotificacionesNoLeidas = (id_usuario, callback) => {
  db.query(
    `SELECT * FROM NOTIFICACIONES 
     WHERE id_usuario = ? AND leida = 0 
     ORDER BY fecha_envio DESC`,
    [id_usuario],
    callback
  );
};

// Obtener una notificación específica por ID
const obtenerNotificacionPorId = (id_notificacion, callback) => {
  db.query(
    'SELECT * FROM NOTIFICACIONES WHERE id_notificacion = ?',
    [id_notificacion],
    callback
  );
};

// Marcar una notificación como leída
const marcarComoLeida = (id_notificacion, callback) => {
  db.query(
    'UPDATE NOTIFICACIONES SET leida = 1, fecha_lectura = NOW() WHERE id_notificacion = ?',
    [id_notificacion],
    callback
  );
};

// Marcar todas las notificaciones de un usuario como leídas
const marcarTodasComoLeidas = (id_usuario, callback) => {
  db.query(
    'UPDATE NOTIFICACIONES SET leida = 1, fecha_lectura = NOW() WHERE id_usuario = ? AND leida = 0',
    [id_usuario],
    callback
  );
};

// Eliminar una notificación específica
const eliminarNotificacion = (id_notificacion, callback) => {
  db.query(
    'DELETE FROM NOTIFICACIONES WHERE id_notificacion = ?',
    [id_notificacion],
    callback
  );
};

// Eliminar todas las notificaciones leídas de un usuario
const eliminarNotificacionesLeidas = (id_usuario, callback) => {
  db.query(
    'DELETE FROM NOTIFICACIONES WHERE id_usuario = ? AND leida = 1',
    [id_usuario],
    callback
  );
};

// Contar notificaciones no leídas de un usuario
const contarNoLeidas = (id_usuario, callback) => {
  db.query(
    'SELECT COUNT(*) as total FROM NOTIFICACIONES WHERE id_usuario = ? AND leida = 0',
    [id_usuario],
    callback
  );
};

module.exports = {
  crearNotificacion,
  obtenerNotificacionesPorUsuario,
  obtenerNotificacionesNoLeidas,
  obtenerNotificacionPorId,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  eliminarNotificacionesLeidas,
  contarNoLeidas
};
