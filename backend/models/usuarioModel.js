const db = require('../config/db');

// <summary>
// Modelo para la gestión de usuarios
// (Interacción con la base de datos de la API)
//</summary>

const crearUsuario = (nombre, email, password_hash, callback) => {
  db.query(
    'INSERT INTO USUARIOS (nombre, email, password_hash) VALUES (?, ?, ?)',
    [nombre, email, password_hash],
    callback
  );
};

const buscarPorEmail = (email, callback) => {
  db.query(
    'SELECT * FROM USUARIOS WHERE email = ?',
    [email],
    callback
  );
};

const mostrarTodos = (callback) => {
  db.query('SELECT * FROM USUARIOS', callback);
};

const findById = (id, callback) => {
  db.query(
    'SELECT * FROM USUARIOS WHERE id_usuario = ?',
    [id],
    callback
  );
};

const updateDateAccess = (id, fecha, callback) => {
  db.query(
    'UPDATE USUARIOS SET ultimo_login = ? WHERE id_usuario = ?',
    [fecha, id],
    callback
  );
};

const updateProfile = (id, nombre, email, foto_perfil, callback) => {
  db.query(
    'UPDATE USUARIOS SET nombre = ?, email = ?, foto_perfil = ? WHERE id_usuario = ?',
    [nombre, email, foto_perfil, id],
    callback
  );
};

module.exports = { crearUsuario, buscarPorEmail, mostrarTodos, findById, updateDateAccess, updateProfile};