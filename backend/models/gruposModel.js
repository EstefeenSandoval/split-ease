const db = require('../config/db');

// <summary>
// Modelo para la gestión de grupos
// (Interacción con la base de datos de la API)
//</summary>

const crearGrupo = (nombre_grupo, descripcion, id_creador, codigo_invitacion, callback) => {
  db.query(
    'INSERT INTO GRUPOS (nombre_grupo, descripcion, id_creador, codigo_invitacion) VALUES (?, ?, ?, ?)',
    [nombre_grupo, descripcion, id_creador, codigo_invitacion],
    callback
  );
};

const obtenerGruposPorUsuario = (id_usuario, callback) => {
  db.query(
    `SELECT g.*, u.nombre as creador_nombre 
     FROM GRUPOS g 
     INNER JOIN PARTICIPANTES_GRUPO pg ON g.id_grupo = pg.id_grupo 
     INNER JOIN USUARIOS u ON g.id_creador = u.id_usuario
     WHERE pg.id_usuario = ? AND pg.estado = 'activo'`,
    [id_usuario],
    callback
  );
};

const obtenerGrupoPorId = (id_grupo, callback) => {
  db.query(
    `SELECT g.*, u.nombre as creador_nombre 
     FROM GRUPOS g 
     INNER JOIN USUARIOS u ON g.id_creador = u.id_usuario
     WHERE g.id_grupo = ?`,
    [id_grupo],
    callback
  );
};

const actualizarGrupo = (id_grupo, nombre_grupo, descripcion, callback) => {
  db.query(
    'UPDATE GRUPOS SET nombre_grupo = ?, descripcion = ? WHERE id_grupo = ?',
    [nombre_grupo, descripcion, id_grupo],
    callback
  );
};

const eliminarGrupo = (id_grupo, callback) => {
  db.query(
    'DELETE FROM GRUPOS WHERE id_grupo = ?',
    [id_grupo],
    callback
  );
};

const verificarMiembroGrupo = (id_usuario, id_grupo, callback) => {
  db.query(
    'SELECT * FROM PARTICIPANTES_GRUPO WHERE id_usuario = ? AND id_grupo = ? AND estado = "activo"',
    [id_usuario, id_grupo],
    callback
  );
};

const agregarParticipante = (id_usuario, id_grupo, rol = 'miembro', callback) => {
  db.query(
    'INSERT INTO PARTICIPANTES_GRUPO (id_usuario, id_grupo, rol, estado) VALUES (?, ?, ?, "activo")',
    [id_usuario, id_grupo, rol],
    callback
  );
};

const buscarPorCodigoInvitacion = (codigo_invitacion, callback) => {
  db.query(
    'SELECT * FROM GRUPOS WHERE codigo_invitacion = ? AND estado = "activo"',
    [codigo_invitacion],
    callback
  );
};

const eliminarParticipante = (id_usuario, id_grupo, callback) => {
  db.query(
    'UPDATE PARTICIPANTES_GRUPO SET estado = "inactivo" WHERE id_usuario = ? AND id_grupo = ?',
    [id_usuario, id_grupo],
    callback
  );
};

const obtenerParticipantesGrupo = (id_grupo, callback) => {
  db.query(
    `SELECT u.id_usuario, u.nombre, u.email, u.foto_perfil, u.ultimo_login, 
            pg.rol, pg.fecha_union, pg.estado
     FROM USUARIOS u 
     INNER JOIN PARTICIPANTES_GRUPO pg ON u.id_usuario = pg.id_usuario 
     WHERE pg.id_grupo = ? AND pg.estado = 'activo'
     ORDER BY pg.rol DESC, u.nombre ASC`,
    [id_grupo],
    callback
  );
};

module.exports = { 
  crearGrupo, 
  obtenerGruposPorUsuario, 
  obtenerGrupoPorId, 
  actualizarGrupo, 
  eliminarGrupo, 
  verificarMiembroGrupo, 
  agregarParticipante, 
  buscarPorCodigoInvitacion,
  eliminarParticipante,
  obtenerParticipantesGrupo
};
