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

/**
 * Crea usuario con token de verificación
 */
const crearUsuarioConVerificacion = (nombre, email, password_hash, token, tokenExpira, callback) => {
  db.query(
    `INSERT INTO USUARIOS (nombre, email, password_hash, email_verificado, token_verificacion, token_verificacion_expira) 
     VALUES (?, ?, ?, 0, ?, ?)`,
    [nombre, email, password_hash, token, tokenExpira],
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

/**
 * Actualiza solo la foto de perfil del usuario
 */
const updateProfilePhoto = (id, foto_perfil, callback) => {
  db.query(
    'UPDATE USUARIOS SET foto_perfil = ? WHERE id_usuario = ?',
    [foto_perfil, id],
    callback
  );
};

// =====================================================
// FUNCIONES DE VERIFICACIÓN DE EMAIL
// =====================================================

/**
 * Actualiza el token de verificación de email
 */
const updateVerificationToken = (userId, token, tokenExpira, callback) => {
  db.query(
    `UPDATE USUARIOS SET token_verificacion = ?, token_verificacion_expira = ? WHERE id_usuario = ?`,
    [token, tokenExpira, userId],
    callback
  );
};

/**
 * Busca usuario por token de verificación
 */
const findByVerificationToken = (token, callback) => {
  db.query(
    `SELECT * FROM USUARIOS WHERE token_verificacion = ? AND token_verificacion_expira > NOW()`,
    [token],
    callback
  );
};

/**
 * Verifica email del usuario por token
 */
const verifyEmailByToken = (token, callback) => {
  db.query(
    `UPDATE USUARIOS SET email_verificado = 1, token_verificacion = NULL, token_verificacion_expira = NULL 
     WHERE token_verificacion = ? AND token_verificacion_expira > NOW()`,
    [token],
    callback
  );
};

/**
 * Verifica si el email del usuario está verificado
 */
const isEmailVerified = (userId, callback) => {
  db.query(
    `SELECT email_verificado FROM USUARIOS WHERE id_usuario = ?`,
    [userId],
    callback
  );
};

/**
 * Verifica si se puede reenviar verificación (rate limit 5 minutos)
 */
const canResendVerification = (userId, callback) => {
  db.query(
    `SELECT ultimo_reenvio_verificacion, 
     TIMESTAMPDIFF(MINUTE, ultimo_reenvio_verificacion, NOW()) as minutos_transcurridos
     FROM USUARIOS WHERE id_usuario = ?`,
    [userId],
    callback
  );
};

/**
 * Actualiza la última vez que se reenvió verificación
 */
const updateLastResendTime = (userId, callback) => {
  db.query(
    `UPDATE USUARIOS SET ultimo_reenvio_verificacion = NOW() WHERE id_usuario = ?`,
    [userId],
    callback
  );
};

// =====================================================
// FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA
// =====================================================

/**
 * Actualiza el token de reset de contraseña
 */
const updateResetToken = (userId, token, tokenExpira, callback) => {
  db.query(
    `UPDATE USUARIOS SET token_reset_password = ?, token_reset_expira = ? WHERE id_usuario = ?`,
    [token, tokenExpira, userId],
    callback
  );
};

/**
 * Busca usuario por token de reset
 */
const findByResetToken = (token, callback) => {
  db.query(
    `SELECT * FROM USUARIOS WHERE token_reset_password = ? AND token_reset_expira > NOW()`,
    [token],
    callback
  );
};

/**
 * Restablece contraseña por token
 */
const resetPasswordByToken = (token, newPasswordHash, callback) => {
  db.query(
    `UPDATE USUARIOS SET password_hash = ?, token_reset_password = NULL, token_reset_expira = NULL 
     WHERE token_reset_password = ? AND token_reset_expira > NOW()`,
    [newPasswordHash, token],
    callback
  );
};

// =====================================================
// FUNCIONES DE CAMBIO DE PERFIL PENDIENTE
// =====================================================

/**
 * Guarda cambios de perfil pendientes de verificación
 */
const savePendingProfileChange = (userId, nuevoNombre, nuevoEmail, token, tokenExpira, callback) => {
  db.query(
    `UPDATE USUARIOS SET 
     cambio_pendiente_nombre = ?, 
     cambio_pendiente_email = ?, 
     token_cambio_perfil = ?, 
     token_cambio_perfil_expira = ? 
     WHERE id_usuario = ?`,
    [nuevoNombre, nuevoEmail, token, tokenExpira, userId],
    callback
  );
};

/**
 * Busca usuario por token de cambio de perfil
 */
const findByProfileChangeToken = (token, callback) => {
  db.query(
    `SELECT * FROM USUARIOS WHERE token_cambio_perfil = ? AND token_cambio_perfil_expira > NOW()`,
    [token],
    callback
  );
};

/**
 * Aplica los cambios de perfil pendientes
 */
const applyPendingProfileChanges = (token, callback) => {
  db.query(
    `UPDATE USUARIOS SET 
     nombre = COALESCE(cambio_pendiente_nombre, nombre),
     email = COALESCE(cambio_pendiente_email, email),
     cambio_pendiente_nombre = NULL,
     cambio_pendiente_email = NULL,
     token_cambio_perfil = NULL,
     token_cambio_perfil_expira = NULL
     WHERE token_cambio_perfil = ? AND token_cambio_perfil_expira > NOW()`,
    [token],
    callback
  );
};

/**
 * Limpia los cambios pendientes sin aplicar
 */
const clearPendingProfileChanges = (userId, callback) => {
  db.query(
    `UPDATE USUARIOS SET 
     cambio_pendiente_nombre = NULL,
     cambio_pendiente_email = NULL,
     token_cambio_perfil = NULL,
     token_cambio_perfil_expira = NULL
     WHERE id_usuario = ?`,
    [userId],
    callback
  );
};

module.exports = { 
  crearUsuario, 
  crearUsuarioConVerificacion,
  buscarPorEmail, 
  mostrarTodos, 
  findById, 
  updateDateAccess, 
  updateProfile,
  updateProfilePhoto,
  // Verificación de email
  updateVerificationToken,
  findByVerificationToken,
  verifyEmailByToken,
  isEmailVerified,
  canResendVerification,
  updateLastResendTime,
  // Recuperación de contraseña
  updateResetToken,
  findByResetToken,
  resetPasswordByToken,
  // Cambio de perfil
  savePendingProfileChange,
  findByProfileChangeToken,
  applyPendingProfileChanges,
  clearPendingProfileChanges
};