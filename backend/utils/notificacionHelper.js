const notificacionModel = require('../models/notificacionModel');

// <summary>
// Helper para crear notificaciones de manera consistente
// Evita duplicados y centraliza la lógica de creación
// </summary>

// Tipos de notificación válidos
const TIPOS_NOTIFICACION = {
  INVITACION: 'INVITACIÓN',
  GASTO_AGREGADO: 'GASTO_AGREGADO',
  PAGO_REALIZADO: 'PAGO_REALIZADO',
  SALDO_CAMBIADO: 'SALDO_CAMBIADO'
};

/**
 * Verifica si ya existe una notificación similar reciente (últimos 5 minutos)
 * para evitar duplicados
 */
const verificarNotificacionDuplicada = (id_usuario, tipo_notificacion, mensaje, callback) => {
  const cincoMinutosAtras = new Date(Date.now() - 5 * 60 * 1000);
  
  notificacionModel.obtenerNotificacionesNoLeidas(id_usuario, (err, results) => {
    if (err) {
      return callback(err, null);
    }
    
    // Buscar notificaciones similares en los últimos 5 minutos
    const duplicada = results.find(notif => {
      const fechaNotif = new Date(notif.fecha_envio);
      return notif.tipo_notificacion === tipo_notificacion &&
             notif.mensaje === mensaje &&
             fechaNotif >= cincoMinutosAtras;
    });
    
    callback(null, !!duplicada);
  });
};

/**
 * Crear notificación evitando duplicados
 */
const crearNotificacionSegura = (id_usuario, tipo_notificacion, mensaje, url_destino = null, callback) => {
  // Verificar duplicados
  verificarNotificacionDuplicada(id_usuario, tipo_notificacion, mensaje, (err, esDuplicada) => {
    if (err) {
      console.error('Error al verificar duplicados:', err);
      // Continuar con la creación aunque haya error en la verificación
    }
    
    if (esDuplicada) {
      console.log('Notificación duplicada detectada, se omite la creación.');
      if (callback) callback(null, { isDuplicate: true });
      return;
    }
    
    // Crear la notificación
    notificacionModel.crearNotificacion(
      id_usuario,
      tipo_notificacion,
      mensaje,
      url_destino,
      (err, result) => {
        if (err) {
          console.error('Error al crear notificación:', err);
          if (callback) callback(err, null);
          return;
        }
        if (callback) callback(null, result);
      }
    );
  });
};

/**
 * Notificar cuando un usuario se une a un grupo
 */
const notificarNuevoMiembro = (id_usuario, nombre_grupo, id_grupo, callback) => {
  const mensaje = `Te has unido al grupo "${nombre_grupo}"`;
  const url_destino = `/grupos/${id_grupo}`;
  
  crearNotificacionSegura(
    id_usuario,
    TIPOS_NOTIFICACION.INVITACION,
    mensaje,
    url_destino,
    callback
  );
};

/**
 * Notificar a los miembros del grupo sobre un nuevo integrante
 */
const notificarGrupoNuevoMiembro = (ids_usuarios, nombre_usuario, nombre_grupo, id_grupo, callback) => {
  if (!ids_usuarios || ids_usuarios.length === 0) {
    if (callback) callback(null, []);
    return;
  }
  
  const mensaje = `${nombre_usuario} se ha unido al grupo "${nombre_grupo}"`;
  const url_destino = `/grupos/${id_grupo}`;
  
  let notificacionesCreadas = 0;
  let errores = [];
  
  ids_usuarios.forEach(id_usuario => {
    crearNotificacionSegura(
      id_usuario,
      TIPOS_NOTIFICACION.INVITACION,
      mensaje,
      url_destino,
      (err, result) => {
        if (err) errores.push(err);
        notificacionesCreadas++;
        
        if (notificacionesCreadas === ids_usuarios.length) {
          if (callback) {
            callback(errores.length > 0 ? errores : null, {
              total: ids_usuarios.length,
              exitosas: ids_usuarios.length - errores.length
            });
          }
        }
      }
    );
  });
};

/**
 * Notificar cuando se agrega un nuevo gasto
 */
const notificarGastoAgregado = (ids_usuarios, nombre_pagador, descripcion_gasto, monto, nombre_grupo, id_grupo, callback) => {
  if (!ids_usuarios || ids_usuarios.length === 0) {
    if (callback) callback(null, []);
    return;
  }
  
  const montoFormateado = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(monto);
  
  const mensaje = `${nombre_pagador} agregó un gasto "${descripcion_gasto || 'Sin descripción'}" de ${montoFormateado} en "${nombre_grupo}"`;
  const url_destino = `/grupos/${id_grupo}/gastos`;
  
  let notificacionesCreadas = 0;
  let errores = [];
  
  ids_usuarios.forEach(id_usuario => {
    crearNotificacionSegura(
      id_usuario,
      TIPOS_NOTIFICACION.GASTO_AGREGADO,
      mensaje,
      url_destino,
      (err, result) => {
        if (err) errores.push(err);
        notificacionesCreadas++;
        
        if (notificacionesCreadas === ids_usuarios.length) {
          if (callback) {
            callback(errores.length > 0 ? errores : null, {
              total: ids_usuarios.length,
              exitosas: ids_usuarios.length - errores.length
            });
          }
        }
      }
    );
  });
};

/**
 * Notificar cuando se realiza un pago (marca división como pagada)
 */
const notificarPagoRealizado = (id_pagador, id_beneficiario, nombre_pagador, monto, nombre_grupo, id_grupo, callback) => {
  const montoFormateado = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(monto);
  
  const mensaje = `${nombre_pagador} ha marcado como pagado ${montoFormateado} en "${nombre_grupo}"`;
  const url_destino = `/grupos/${id_grupo}/gastos`;
  
  crearNotificacionSegura(
    id_beneficiario,
    TIPOS_NOTIFICACION.PAGO_REALIZADO,
    mensaje,
    url_destino,
    callback
  );
};

/**
 * Notificar cuando se realiza un pago parcial
 */
const notificarPagoParcial = (id_pagador, id_beneficiario, nombre_pagador, monto, nombre_grupo, id_grupo, callback) => {
  const montoFormateado = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(monto);
  
  const mensaje = `${nombre_pagador} te ha enviado un pago parcial de ${montoFormateado} en "${nombre_grupo}"`;
  const url_destino = `/grupos/${id_grupo}/gastos`;
  
  crearNotificacionSegura(
    id_beneficiario,
    TIPOS_NOTIFICACION.PAGO_REALIZADO,
    mensaje,
    url_destino,
    callback
  );
};

/**
 * Notificar cambio de saldo a un usuario
 */
const notificarSaldoCambiado = (id_usuario, saldo_anterior, saldo_nuevo, nombre_grupo, id_grupo, callback) => {
  const diferencia = saldo_nuevo - saldo_anterior;
  const diferenciaFormateada = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(Math.abs(diferencia));
  
  let mensaje;
  if (diferencia > 0) {
    mensaje = `Tu saldo aumentó ${diferenciaFormateada} en "${nombre_grupo}"`;
  } else if (diferencia < 0) {
    mensaje = `Tu saldo disminuyó ${diferenciaFormateada} en "${nombre_grupo}"`;
  } else {
    // No notificar si no hay cambio
    if (callback) callback(null, { noChange: true });
    return;
  }
  
  const url_destino = `/grupos/${id_grupo}`;
  
  crearNotificacionSegura(
    id_usuario,
    TIPOS_NOTIFICACION.SALDO_CAMBIADO,
    mensaje,
    url_destino,
    callback
  );
};

module.exports = {
  TIPOS_NOTIFICACION,
  crearNotificacionSegura,
  notificarNuevoMiembro,
  notificarGrupoNuevoMiembro,
  notificarGastoAgregado,
  notificarPagoRealizado,
  notificarPagoParcial,
  notificarSaldoCambiado
};
