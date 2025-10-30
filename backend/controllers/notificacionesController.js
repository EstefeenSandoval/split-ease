const notificacionModel = require('../models/notificacionModel');

// <summary>
// Controlador para la gestión de notificaciones
// Manejo de base de datos en models/notificacionModel.js
// (Logica de la API)
//</summary>

// Tipos de notificación válidos según el ENUM de la base de datos
const TIPOS_NOTIFICACION_VALIDOS = ['INVITACIÓN', 'GASTO_AGREGADO', 'PAGO_REALIZADO', 'SALDO_CAMBIADO'];

// Crear una nueva notificación
const crearNotificacion = async (req, res) => {
  try {
    const { id_usuario, tipo_notificacion, mensaje, url_destino } = req.body;

    // Validaciones
    if (!id_usuario || !tipo_notificacion || !mensaje) {
      return res.status(400).json({ 
        success: false,
        error: 'Los campos id_usuario, tipo_notificacion y mensaje son obligatorios.' 
      });
    }

    // Validar que el tipo de notificación sea válido
    if (!TIPOS_NOTIFICACION_VALIDOS.includes(tipo_notificacion)) {
      return res.status(400).json({ 
        success: false,
        error: `El tipo de notificación debe ser uno de: ${TIPOS_NOTIFICACION_VALIDOS.join(', ')}` 
      });
    }

    // Sanitización básica
    const sanitizedMensaje = String(mensaje).trim();
    const sanitizedUrlDestino = url_destino ? String(url_destino).trim() : null;

    if (!sanitizedMensaje) {
      return res.status(400).json({ 
        success: false,
        error: 'El mensaje no puede estar vacío.' 
      });
    }

    notificacionModel.crearNotificacion(
      id_usuario, 
      tipo_notificacion, 
      sanitizedMensaje, 
      sanitizedUrlDestino, 
      (err, result) => {
        if (err) {
          console.error('Error al crear notificación:', err);
          return res.status(500).json({ 
            success: false,
            error: 'Error al crear la notificación.' 
          });
        }

        // Obtener la notificación recién creada para devolverla completa
        const id_notificacion = result.insertId;
        notificacionModel.obtenerNotificacionPorId(id_notificacion, (err, notificaciones) => {
          if (err || notificaciones.length === 0) {
            return res.status(201).json({ 
              success: true,
              message: 'Notificación creada exitosamente.',
              data: { id_notificacion }
            });
          }

          res.status(201).json({ 
            success: true,
            message: 'Notificación creada exitosamente.',
            data: notificaciones[0]
          });
        });
      }
    );
  } catch (error) {
    console.error('Error en crearNotificacion:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor.' 
    });
  }
};

// Obtener todas las notificaciones de un usuario
const obtenerNotificacionesUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // Validar que el id_usuario sea un número válido
    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ 
        success: false,
        error: 'El id_usuario debe ser un número válido.' 
      });
    }

    notificacionModel.obtenerNotificacionesPorUsuario(id_usuario, (err, notificaciones) => {
      if (err) {
        console.error('Error al obtener notificaciones:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Error al obtener las notificaciones.' 
        });
      }

      res.status(200).json({ 
        success: true,
        count: notificaciones.length,
        data: notificaciones
      });
    });
  } catch (error) {
    console.error('Error en obtenerNotificacionesUsuario:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor.' 
    });
  }
};

// Obtener solo las notificaciones no leídas de un usuario
const obtenerNotificacionesNoLeidas = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // Validar que el id_usuario sea un número válido
    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ 
        success: false,
        error: 'El id_usuario debe ser un número válido.' 
      });
    }

    notificacionModel.obtenerNotificacionesNoLeidas(id_usuario, (err, notificaciones) => {
      if (err) {
        console.error('Error al obtener notificaciones no leídas:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Error al obtener las notificaciones no leídas.' 
        });
      }

      res.status(200).json({ 
        success: true,
        count: notificaciones.length,
        data: notificaciones
      });
    });
  } catch (error) {
    console.error('Error en obtenerNotificacionesNoLeidas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor.' 
    });
  }
};

// Obtener una notificación específica por ID
const obtenerNotificacionPorId = async (req, res) => {
  try {
    const { id_notificacion } = req.params;

    // Validar que el id_notificacion sea un número válido
    if (!id_notificacion || isNaN(id_notificacion)) {
      return res.status(400).json({ 
        success: false,
        error: 'El id_notificacion debe ser un número válido.' 
      });
    }

    notificacionModel.obtenerNotificacionPorId(id_notificacion, (err, notificaciones) => {
      if (err) {
        console.error('Error al obtener notificación:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Error al obtener la notificación.' 
        });
      }

      if (notificaciones.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Notificación no encontrada.' 
        });
      }

      res.status(200).json({ 
        success: true,
        data: notificaciones[0]
      });
    });
  } catch (error) {
    console.error('Error en obtenerNotificacionPorId:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor.' 
    });
  }
};

// Marcar una notificación como leída
const marcarComoLeida = async (req, res) => {
  try {
    const { id_notificacion } = req.params;

    // Validar que el id_notificacion sea un número válido
    if (!id_notificacion || isNaN(id_notificacion)) {
      return res.status(400).json({ 
        success: false,
        error: 'El id_notificacion debe ser un número válido.' 
      });
    }

    // Verificar que la notificación existe antes de actualizarla
    notificacionModel.obtenerNotificacionPorId(id_notificacion, (err, notificaciones) => {
      if (err) {
        console.error('Error al verificar notificación:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Error al verificar la notificación.' 
        });
      }

      if (notificaciones.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Notificación no encontrada.' 
        });
      }

      // Marcar como leída
      notificacionModel.marcarComoLeida(id_notificacion, (err, result) => {
        if (err) {
          console.error('Error al marcar notificación como leída:', err);
          return res.status(500).json({ 
            success: false,
            error: 'Error al marcar la notificación como leída.' 
          });
        }

        // Obtener la notificación actualizada
        notificacionModel.obtenerNotificacionPorId(id_notificacion, (err, notificacionesActualizadas) => {
          if (err || notificacionesActualizadas.length === 0) {
            return res.status(200).json({ 
              success: true,
              message: 'Notificación marcada como leída exitosamente.'
            });
          }

          res.status(200).json({ 
            success: true,
            message: 'Notificación marcada como leída exitosamente.',
            data: notificacionesActualizadas[0]
          });
        });
      });
    });
  } catch (error) {
    console.error('Error en marcarComoLeida:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor.' 
    });
  }
};

// Marcar todas las notificaciones de un usuario como leídas
const marcarTodasComoLeidas = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // Validar que el id_usuario sea un número válido
    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ 
        success: false,
        error: 'El id_usuario debe ser un número válido.' 
      });
    }

    notificacionModel.marcarTodasComoLeidas(id_usuario, (err, result) => {
      if (err) {
        console.error('Error al marcar todas las notificaciones como leídas:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Error al marcar todas las notificaciones como leídas.' 
        });
      }

      res.status(200).json({ 
        success: true,
        message: 'Todas las notificaciones fueron marcadas como leídas exitosamente.',
        affectedRows: result.affectedRows
      });
    });
  } catch (error) {
    console.error('Error en marcarTodasComoLeidas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor.' 
    });
  }
};

// Eliminar una notificación específica
const eliminarNotificacion = async (req, res) => {
  try {
    const { id_notificacion } = req.params;

    // Validar que el id_notificacion sea un número válido
    if (!id_notificacion || isNaN(id_notificacion)) {
      return res.status(400).json({ 
        success: false,
        error: 'El id_notificacion debe ser un número válido.' 
      });
    }

    // Verificar que la notificación existe antes de eliminarla
    notificacionModel.obtenerNotificacionPorId(id_notificacion, (err, notificaciones) => {
      if (err) {
        console.error('Error al verificar notificación:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Error al verificar la notificación.' 
        });
      }

      if (notificaciones.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Notificación no encontrada.' 
        });
      }

      // Eliminar la notificación
      notificacionModel.eliminarNotificacion(id_notificacion, (err, result) => {
        if (err) {
          console.error('Error al eliminar notificación:', err);
          return res.status(500).json({ 
            success: false,
            error: 'Error al eliminar la notificación.' 
          });
        }

        res.status(200).json({ 
          success: true,
          message: 'Notificación eliminada exitosamente.'
        });
      });
    });
  } catch (error) {
    console.error('Error en eliminarNotificacion:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor.' 
    });
  }
};

// Eliminar todas las notificaciones leídas de un usuario
const eliminarNotificacionesLeidas = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // Validar que el id_usuario sea un número válido
    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ 
        success: false,
        error: 'El id_usuario debe ser un número válido.' 
      });
    }

    notificacionModel.eliminarNotificacionesLeidas(id_usuario, (err, result) => {
      if (err) {
        console.error('Error al eliminar notificaciones leídas:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Error al eliminar las notificaciones leídas.' 
        });
      }

      res.status(200).json({ 
        success: true,
        message: 'Notificaciones leídas eliminadas exitosamente.',
        affectedRows: result.affectedRows
      });
    });
  } catch (error) {
    console.error('Error en eliminarNotificacionesLeidas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor.' 
    });
  }
};

// Contar notificaciones no leídas de un usuario
const contarNoLeidas = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // Validar que el id_usuario sea un número válido
    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ 
        success: false,
        error: 'El id_usuario debe ser un número válido.' 
      });
    }

    notificacionModel.contarNoLeidas(id_usuario, (err, resultado) => {
      if (err) {
        console.error('Error al contar notificaciones no leídas:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Error al contar las notificaciones no leídas.' 
        });
      }

      res.status(200).json({ 
        success: true,
        total: resultado[0].total
      });
    });
  } catch (error) {
    console.error('Error en contarNoLeidas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor.' 
    });
  }
};

// Server-Sent Events (SSE) para notificaciones en tiempo real
const streamNotificaciones = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    // Validar que el id_usuario sea un número válido
    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ 
        success: false,
        error: 'El id_usuario debe ser un número válido.' 
      });
    }

    // Configurar headers para SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Enviar un comentario inicial para establecer la conexión
    res.write(': connected\n\n');

    // Mantener track de las notificaciones ya enviadas para evitar duplicados
    let notificacionesEnviadas = new Set();

    // Función para enviar solo notificaciones nuevas
    const enviarNotificacionesNuevas = () => {
      notificacionModel.obtenerNotificacionesNoLeidas(id_usuario, (err, notificaciones) => {
        if (err) {
          console.error('Error al obtener notificaciones en stream:', err);
          return;
        }

        // Filtrar solo las notificaciones que no hemos enviado aún
        const notificacionesNuevas = notificaciones.filter(notif => 
          !notificacionesEnviadas.has(notif.id_notificacion)
        );

        // Enviar solo las notificaciones nuevas
        if (notificacionesNuevas.length > 0) {
          // Agregar los IDs al set de enviadas
          notificacionesNuevas.forEach(notif => {
            notificacionesEnviadas.add(notif.id_notificacion);
          });

          res.write(`data: ${JSON.stringify({ 
            type: 'notificaciones',
            count: notificacionesNuevas.length,
            data: notificacionesNuevas 
          })}\n\n`);
        }
      });
    };

    // Enviar notificaciones inicialmente
    enviarNotificacionesNuevas();

    // Establecer intervalo para verificar nuevas notificaciones cada 10 segundos
    const intervalId = setInterval(enviarNotificacionesNuevas, 10000);

    // Limpiar el intervalo cuando el cliente se desconecte
    req.on('close', () => {
      clearInterval(intervalId);
      res.end();
    });

  } catch (error) {
    console.error('Error en streamNotificaciones:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor.' 
    });
  }
};

module.exports = {
  crearNotificacion,
  obtenerNotificacionesUsuario,
  obtenerNotificacionesNoLeidas,
  obtenerNotificacionPorId,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  eliminarNotificacionesLeidas,
  contarNoLeidas,
  streamNotificaciones
};
