const db = require('../config/db');

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

module.exports = { crearUsuario, buscarPorEmail, mostrarTodos, findById };