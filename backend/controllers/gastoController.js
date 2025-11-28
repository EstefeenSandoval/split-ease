const gastoModel = require('../models/gastoModel');
const gruposModel = require('../models/gruposModel');
const notificacionHelper = require('../utils/notificacionHelper');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// <summary>
// Controlador para la gestión de gastos y categorías
// Manejo de base de datos en models/gastoModel.js
// (Logica de la API)
//</summary>

// =========== CATEGORÍAS ===========

// Obtener todas las categorías
const obtenerCategorias = (req, res) => {
  gastoModel.obtenerCategorias((err, results) => {
    if (err) {
      console.error('Error al obtener categorías:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
    
    res.status(200).json({ 
      mensaje: 'Categorías obtenidas correctamente.',
      categorias: results 
    });
  });
};

// Crear nueva categoría
const crearCategoria = (req, res) => {
  const { nombre, descripcion } = req.body;
  
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
  }
  
  // Sanitización básica
  const sanitizedNombre = String(nombre).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').trim();
  const sanitizedDescripcion = descripcion ? String(descripcion).trim() : null;
  
  if (!sanitizedNombre) {
    return res.status(400).json({ error: 'El nombre de la categoría no es válido.' });
  }
  
  gastoModel.crearCategoria(sanitizedNombre, sanitizedDescripcion, (err, result) => {
    if (err) {
      console.error('Error al crear categoría:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Ya existe una categoría con ese nombre.' });
      }
      return res.status(500).json({ error: 'Error al crear la categoría.' });
    }
    
    res.status(201).json({ 
      mensaje: 'Categoría creada correctamente.',
      id_categoria: result.insertId 
    });
  });
};

// =========== GASTOS ===========

// Crear un nuevo gasto
const crearGasto = (req, res) => {
  const { id_grupo, descripcion, monto_total, id_categoria, fecha_gasto, participantes, tipo_division, moneda, id_pagador } = req.body;
  const id_usuario_autenticado = req.usuario.id_usuario; // Del token JWT
  
  // Si no se especifica id_pagador, usar el usuario autenticado
  const id_pagador_final = id_pagador ? parseInt(id_pagador) : id_usuario_autenticado;
  
  // Validaciones básicas
  if (!id_grupo || !monto_total || !participantes || !Array.isArray(participantes) || participantes.length === 0) {
    return res.status(400).json({ error: 'Grupo, monto total y participantes son obligatorios.' });
  }
  
  if (isNaN(monto_total) || parseFloat(monto_total) <= 0) {
    return res.status(400).json({ error: 'El monto debe ser un número positivo.' });
  }
  
  // Sanitización
  const sanitizedDescripcion = descripcion ? String(descripcion).trim() : null;
  const sanitizedMontoTotal = parseFloat(monto_total);
  const sanitizedIdCategoria = id_categoria ? parseInt(id_categoria) : null;
  const sanitizedFechaGasto = fecha_gasto ? new Date(fecha_gasto) : new Date();
  const sanitizedMoneda = moneda || 'MXN';
  const sanitizedTipoDivision = tipo_division || 'equitativa';
  
  // Verificar que el usuario autenticado pertenece al grupo (para permisos de creación)
  gruposModel.verificarMiembroGrupo(id_usuario_autenticado, id_grupo, (err, results) => {
    if (err) {
      console.error('Error al verificar membresía del usuario autenticado:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
    
    if (results.length === 0) {
      return res.status(403).json({ error: 'No tienes permisos para agregar gastos a este grupo.' });
    }
    
    // Si se especificó un pagador diferente, verificar que también sea miembro del grupo
    if (id_pagador_final !== id_usuario_autenticado) {
      gruposModel.verificarMiembroGrupo(id_pagador_final, id_grupo, (err, results) => {
        if (err) {
          console.error('Error al verificar membresía del pagador:', err);
          return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        
        if (results.length === 0) {
          return res.status(400).json({ error: 'El pagador especificado no es miembro del grupo.' });
        }
        
        // Proceder a crear el gasto
        crearGastoEnBD();
      });
    } else {
      // El pagador es el mismo que el usuario autenticado, ya verificado
      crearGastoEnBD();
    }
    
    function crearGastoEnBD() {
      // Crear el gasto
      gastoModel.crearGasto(
        id_grupo, 
        id_pagador_final, 
        sanitizedDescripcion, 
        sanitizedMontoTotal, 
        sanitizedIdCategoria, 
        sanitizedFechaGasto, 
        sanitizedMoneda,
        (err, result) => {
          if (err) {
            console.error('Error al crear gasto:', err);
            return res.status(500).json({ error: 'Error al crear el gasto.' });
          }
          
          const id_gasto = result.insertId;
          
          // Calcular divisiones según el tipo
          let divisiones = [];
          const numParticipantes = participantes.length;
          
          if (sanitizedTipoDivision === 'equitativa') {
            const montoPorPersona = sanitizedMontoTotal / numParticipantes;
            divisiones = participantes.map(id_usuario => ({
              id_usuario: parseInt(id_usuario),
              monto_asignado: parseFloat(montoPorPersona.toFixed(2))
            }));
          } else if (sanitizedTipoDivision === 'monto_fijo' && req.body.montos_personalizados) {
            // Para montos personalizados
            divisiones = req.body.montos_personalizados.map(item => ({
              id_usuario: parseInt(item.id_usuario),
              monto_asignado: parseFloat(item.monto)
            }));
          }
          
          // Crear las divisiones
          let divisionesCreadas = 0;
          let errorEnDivisiones = false;
          
          divisiones.forEach(division => {
            gastoModel.crearDivisionGasto(
              id_gasto,
              division.id_usuario,
              division.monto_asignado,
              sanitizedTipoDivision,
              (err) => {
                if (err && !errorEnDivisiones) {
                  errorEnDivisiones = true;
                  console.error('Error al crear división:', err);
                  // Eliminar el gasto si fallan las divisiones
                  gastoModel.eliminarGasto(id_gasto, () => {});
                  return res.status(500).json({ error: 'Error al crear las divisiones del gasto.' });
                }
                
                divisionesCreadas++;
                if (divisionesCreadas === divisiones.length && !errorEnDivisiones) {
                  // Marcar automáticamente la división del pagador como pagada
                  gastoModel.marcarDivisionComoPagada(id_gasto, id_pagador_final, (err) => {
                    if (err) {
                      console.error('Error al marcar división del pagador como pagada:', err);
                      // No fallar la creación del gasto por esto
                    }
                    
                    // Obtener información del pagador y del grupo para las notificaciones
                    const db = require('../config/db');
                    db.query('SELECT nombre FROM USUARIOS WHERE id_usuario = ?', [id_pagador_final], (err, usuarioResults) => {
                      const nombrePagador = usuarioResults && usuarioResults[0] ? usuarioResults[0].nombre : 'Un usuario';
                      
                      gruposModel.obtenerGrupoPorId(id_grupo, (err, grupoResults) => {
                        const nombreGrupo = grupoResults && grupoResults[0] ? grupoResults[0].nombre_grupo : 'el grupo';
                        
                        // Notificar a todos los participantes del gasto (excepto al pagador)
                        const idsNotificar = participantes
                          .map(id => parseInt(id))
                          .filter(id => id !== id_pagador_final);
                        
                        if (idsNotificar.length > 0) {
                          notificacionHelper.notificarGastoAgregado(
                            idsNotificar,
                            nombrePagador,
                            sanitizedDescripcion,
                            sanitizedMontoTotal,
                            nombreGrupo,
                            id_grupo,
                            (err) => {
                              if (err) console.error('Error al notificar gasto agregado:', err);
                            }
                          );
                        }
                      });
                    });
                    
                    res.status(201).json({ 
                      mensaje: 'Gasto creado correctamente.',
                      id_gasto: id_gasto 
                    });
                  });
                }
              }
            );
          });
        }
      );
    }
  });
};

// Obtener gastos de un grupo
const obtenerGastosPorGrupo = (req, res) => {
  const { id_grupo } = req.params;
  const id_usuario = req.usuario.id_usuario;
  
  if (!id_grupo || isNaN(id_grupo)) {
    return res.status(400).json({ error: 'ID de grupo no válido.' });
  }
  
  // Verificar que el usuario pertenece al grupo
  gruposModel.verificarMiembroGrupo(id_usuario, id_grupo, (err, results) => {
    if (err) {
      console.error('Error al verificar membresía:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
    
    if (results.length === 0) {
      return res.status(403).json({ error: 'No tienes permisos para ver los gastos de este grupo.' });
    }
    
    gastoModel.obtenerGastosPorGrupo(id_grupo, (err, results) => {
      if (err) {
        console.error('Error al obtener gastos:', err);
        return res.status(500).json({ error: 'Error al obtener los gastos.' });
      }
      
      res.status(200).json({ 
        mensaje: 'Gastos obtenidos correctamente.',
        gastos: results 
      });
    });
  });
};

// Obtener detalles de un gasto específico
const obtenerDetalleGasto = (req, res) => {
  const { id_gasto } = req.params;
  const id_usuario = req.usuario.id_usuario;
  
  if (!id_gasto || isNaN(id_gasto)) {
    return res.status(400).json({ error: 'ID de gasto no válido.' });
  }
  
  gastoModel.obtenerGastoPorId(id_gasto, (err, results) => {
    if (err) {
      console.error('Error al obtener gasto:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado.' });
    }
    
    const gasto = results[0];
    
    // Verificar que el usuario pertenece al grupo del gasto
    gruposModel.verificarMiembroGrupo(id_usuario, gasto.id_grupo, (err, results) => {
      if (err) {
        console.error('Error al verificar membresía:', err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
      }
      
      if (results.length === 0) {
        return res.status(403).json({ error: 'No tienes permisos para ver este gasto.' });
      }
      
      // Obtener las divisiones del gasto
      gastoModel.obtenerDivisionesPorGasto(id_gasto, (err, divisiones) => {
        if (err) {
          console.error('Error al obtener divisiones:', err);
          return res.status(500).json({ error: 'Error al obtener las divisiones.' });
        }
        
        res.status(200).json({ 
          mensaje: 'Detalle de gasto obtenido correctamente.',
          gasto: {
            ...gasto,
            divisiones: divisiones
          }
        });
      });
    });
  });
};

// Actualizar un gasto
const actualizarGasto = (req, res) => {
  const { id_gasto } = req.params;
  const { descripcion, monto_total, id_categoria, fecha_gasto } = req.body;
  const id_usuario = req.usuario.id_usuario;
  
  if (!id_gasto || isNaN(id_gasto)) {
    return res.status(400).json({ error: 'ID de gasto no válido.' });
  }
  
  if (!monto_total || isNaN(monto_total) || parseFloat(monto_total) <= 0) {
    return res.status(400).json({ error: 'El monto debe ser un número positivo.' });
  }
  
  // Obtener el gasto para verificar permisos
  gastoModel.obtenerGastoPorId(id_gasto, (err, results) => {
    if (err) {
      console.error('Error al obtener gasto:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado.' });
    }
    
    const gasto = results[0];
    
    // Solo el pagador puede editar el gasto
    if (gasto.id_pagador !== id_usuario) {
      return res.status(403).json({ error: 'Solo el pagador puede editar este gasto.' });
    }
    
    // Sanitización
    const sanitizedDescripcion = descripcion ? String(descripcion).trim() : null;
    const sanitizedMontoTotal = parseFloat(monto_total);
    const sanitizedIdCategoria = id_categoria ? parseInt(id_categoria) : null;
    const sanitizedFechaGasto = fecha_gasto ? new Date(fecha_gasto) : gasto.fecha_gasto;
    
    // Actualizar el gasto
    gastoModel.actualizarGasto(
      id_gasto, 
      sanitizedDescripcion, 
      sanitizedMontoTotal, 
      sanitizedIdCategoria, 
      sanitizedFechaGasto,
      (err, result) => {
        if (err) {
          console.error('Error al actualizar gasto:', err);
          return res.status(500).json({ error: 'Error al actualizar el gasto.' });
        }
        
        // Si el monto cambió, actualizar las divisiones
        if (sanitizedMontoTotal !== gasto.monto_total) {
          // Obtener las divisiones existentes
          gastoModel.obtenerDivisionesPorGasto(id_gasto, (err, divisiones) => {
            if (err) {
              console.error('Error al obtener divisiones:', err);
              return res.status(500).json({ error: 'Error al obtener las divisiones.' });
            }
            
            if (divisiones.length === 0) {
              return res.status(200).json({ mensaje: 'Gasto actualizado correctamente.' });
            }
            
            // Verificar si es división equitativa
            const tipoDivision = divisiones[0].tipo_division;
            
            if (tipoDivision === 'equitativa') {
              // Recalcular monto por persona
              const numParticipantes = divisiones.length;
              const montoPorPersona = parseFloat((sanitizedMontoTotal / numParticipantes).toFixed(2));
              
              // Actualizar cada división
              let divisionesActualizadas = 0;
              let errorEnActualizacion = false;
              
              divisiones.forEach(division => {
                gastoModel.actualizarDivisionGasto(
                  id_gasto,
                  division.id_usuario,
                  montoPorPersona,
                  (err) => {
                    if (err && !errorEnActualizacion) {
                      errorEnActualizacion = true;
                      console.error('Error al actualizar división:', err);
                      return res.status(500).json({ error: 'Error al actualizar las divisiones del gasto.' });
                    }
                    
                    divisionesActualizadas++;
                    if (divisionesActualizadas === divisiones.length && !errorEnActualizacion) {
                      res.status(200).json({ 
                        mensaje: 'Gasto y divisiones actualizados correctamente.',
                        divisiones_recalculadas: true
                      });
                    }
                  }
                );
              });
            } else {
              // Para divisiones no equitativas, solo respondemos que el gasto se actualizó
              res.status(200).json({ 
                mensaje: 'Gasto actualizado correctamente. Las divisiones personalizadas no se modificaron.',
                divisiones_recalculadas: false
              });
            }
          });
        } else {
          // Si el monto no cambió, solo responder que se actualizó
          res.status(200).json({ mensaje: 'Gasto actualizado correctamente.' });
        }
      }
    );
  });
};

// Eliminar un gasto
const eliminarGasto = (req, res) => {
  const { id_gasto } = req.params;
  const id_usuario = req.usuario.id_usuario;
  
  if (!id_gasto || isNaN(id_gasto)) {
    return res.status(400).json({ error: 'ID de gasto no válido.' });
  }
  
  // Obtener el gasto para verificar permisos
  gastoModel.obtenerGastoPorId(id_gasto, (err, results) => {
    if (err) {
      console.error('Error al obtener gasto:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado.' });
    }
    
    const gasto = results[0];
    
    // Solo el pagador puede eliminar el gasto
    if (gasto.id_pagador !== id_usuario) {
      return res.status(403).json({ error: 'Solo el pagador puede eliminar este gasto.' });
    }
    
    gastoModel.eliminarGasto(id_gasto, (err, result) => {
      if (err) {
        console.error('Error al eliminar gasto:', err);
        return res.status(500).json({ error: 'Error al eliminar el gasto.' });
      }
      
      res.status(200).json({ mensaje: 'Gasto eliminado correctamente.' });
    });
  });
};

// Marcar división como pagada
const marcarComoPagado = (req, res) => {
  const { id_gasto } = req.params;
  const id_usuario = req.usuario.id_usuario;
  
  if (!id_gasto || isNaN(id_gasto)) {
    return res.status(400).json({ error: 'ID de gasto no válido.' });
  }
  
  // Primero obtener información del gasto y la división
  gastoModel.obtenerGastoPorId(id_gasto, (err, gastoResults) => {
    if (err || gastoResults.length === 0) {
      console.error('Error al obtener gasto:', err);
      return res.status(404).json({ error: 'Gasto no encontrado.' });
    }
    
    const gasto = gastoResults[0];
    
    // Obtener la división específica del usuario
    gastoModel.obtenerDivisionesPorGasto(id_gasto, (err, divisiones) => {
      if (err) {
        console.error('Error al obtener divisiones:', err);
        return res.status(500).json({ error: 'Error al obtener información del gasto.' });
      }
      
      const division = divisiones.find(d => d.id_usuario === id_usuario);
      if (!division) {
        return res.status(404).json({ error: 'División no encontrada.' });
      }
      
      // Marcar como pagado
      gastoModel.marcarDivisionComoPagada(id_gasto, id_usuario, (err, result) => {
        if (err) {
          console.error('Error al marcar como pagado:', err);
          return res.status(500).json({ error: 'Error al marcar como pagado.' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'División no encontrada.' });
        }
        
        // Verificar si todas las divisiones están pagadas para cambiar el estado del gasto
        gastoModel.obtenerDivisionesPorGasto(id_gasto, (err, todasLasDivisiones) => {
          if (err) {
            console.error('Error al verificar divisiones:', err);
            // No fallar la operación por esto, solo loggear
          } else {
            // Verificar si todas las divisiones están pagadas
            const todasPagadas = todasLasDivisiones.every(division => division.pagado === 1);
            
            if (todasPagadas && gasto.estado === 'pendiente') {
              // Cambiar el estado del gasto a confirmado
              gastoModel.actualizarEstadoGasto(id_gasto, 'confirmado', (err, result) => {
                if (err) {
                  console.error('Error al actualizar estado del gasto:', err);
                } else {
                  console.log(`Gasto ${id_gasto} marcado como confirmado - todas las divisiones pagadas`);
                }
              });
            }
          }
          
          // Obtener información del usuario que pagó
          const db = require('../config/db');
          db.query('SELECT nombre FROM USUARIOS WHERE id_usuario = ?', [id_usuario], (err, usuarioResults) => {
            const nombrePagador = usuarioResults && usuarioResults[0] ? usuarioResults[0].nombre : 'Un usuario';
            
            // Obtener información del grupo
            gruposModel.obtenerGrupoPorId(gasto.id_grupo, (err, grupoResults) => {
              const nombreGrupo = grupoResults && grupoResults[0] ? grupoResults[0].nombre_grupo : 'el grupo';
              
              // Notificar al pagador original del gasto
              if (gasto.id_pagador !== id_usuario) {
                notificacionHelper.notificarPagoRealizado(
                  id_usuario,
                  gasto.id_pagador,
                  nombrePagador,
                  division.monto_asignado,
                  nombreGrupo,
                  gasto.id_grupo,
                  (err) => {
                    if (err) console.error('Error al notificar pago realizado:', err);
                  }
                );
              }
            });
          });
          
          res.status(200).json({ mensaje: 'Marcado como pagado correctamente.' });
        });
      });
    });
  });
};

// =========== PAGOS PARCIALES ===========

// Realizar un pago parcial
const realizarPagoParcial = (req, res) => {
  const { id_gasto, id_usuario_receptor, monto } = req.body;
  const id_usuario_pagador = req.usuario.id_usuario; // Del token JWT
  
  // Validaciones básicas
  if (!id_gasto || !id_usuario_receptor || !monto) {
    return res.status(400).json({ error: 'id_gasto, id_usuario_receptor y monto son obligatorios.' });
  }
  
  if (isNaN(monto) || parseFloat(monto) <= 0) {
    return res.status(400).json({ error: 'El monto debe ser un número positivo.' });
  }
  
  if (id_usuario_pagador === parseInt(id_usuario_receptor)) {
    return res.status(400).json({ error: 'No puedes hacer un pago a ti mismo.' });
  }
  
  // Obtener el gasto para verificar permisos y obtener id_grupo
  gastoModel.obtenerGastoPorId(id_gasto, (err, results) => {
    if (err) {
      console.error('Error al obtener gasto:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado.' });
    }
    
    const gasto = results[0];
    const sanitizedMonto = parseFloat(monto);
    
    // Verificar que el usuario pagador es miembro del grupo
    gruposModel.verificarMiembroGrupo(id_usuario_pagador, gasto.id_grupo, (err, memberResults) => {
      if (err) {
        console.error('Error al verificar membresía del pagador:', err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
      }
      
      if (memberResults.length === 0) {
        return res.status(403).json({ error: 'No tienes permisos para hacer pagos en este grupo.' });
      }
      
      // Verificar que el usuario receptor es miembro del grupo
      gruposModel.verificarMiembroGrupo(parseInt(id_usuario_receptor), gasto.id_grupo, (err, receptorResults) => {
        if (err) {
          console.error('Error al verificar membresía del receptor:', err);
          return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        
        if (receptorResults.length === 0) {
          return res.status(400).json({ error: 'El usuario receptor no es miembro del grupo.' });
        }
        
        // Crear el pago parcial
        const descripcion = `Pago parcial para gasto: ${gasto.descripcion}`;
        gastoModel.crearPagoParcial(
          id_usuario_pagador,
          parseInt(id_usuario_receptor),
          gasto.id_grupo,
          id_gasto,
          sanitizedMonto,
          descripcion,
          (err, result) => {
            if (err) {
              console.error('Error al crear pago parcial:', err);
              return res.status(500).json({ error: 'Error al crear el pago parcial.' });
            }
            
            // Obtener información para notificaciones
            const db = require('../config/db');
            db.query('SELECT nombre FROM USUARIOS WHERE id_usuario = ?', [id_usuario_pagador], (err, usuarioResults) => {
              const nombrePagador = usuarioResults && usuarioResults[0] ? usuarioResults[0].nombre : 'Un usuario';
              
              // Notificar al receptor del pago
              notificacionHelper.notificarPagoParcial(
                id_usuario_pagador,
                parseInt(id_usuario_receptor),
                nombrePagador,
                sanitizedMonto,
                gasto.nombre_grupo || 'el grupo',
                gasto.id_grupo,
                (err) => {
                  if (err) console.error('Error al notificar pago parcial:', err);
                }
              );
            });
            
            res.status(201).json({ 
              mensaje: 'Pago parcial registrado correctamente.',
              id_pago: result.insertId 
            });
          }
        );
      });
    });
  });
};

// Obtener pagos de un gasto
const obtenerPagosPorGasto = (req, res) => {
  const { id_gasto } = req.params;
  const id_usuario = req.usuario.id_usuario;
  
  if (!id_gasto || isNaN(id_gasto)) {
    return res.status(400).json({ error: 'ID de gasto no válido.' });
  }
  
  // Obtener el gasto para verificar permisos
  gastoModel.obtenerGastoPorId(id_gasto, (err, gastoResults) => {
    if (err) {
      console.error('Error al obtener gasto:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
    
    if (gastoResults.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado.' });
    }
    
    const gasto = gastoResults[0];
    
    // Verificar que el usuario es miembro del grupo
    gruposModel.verificarMiembroGrupo(id_usuario, gasto.id_grupo, (err, memberResults) => {
      if (err) {
        console.error('Error al verificar membresía:', err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
      }
      
      if (memberResults.length === 0) {
        return res.status(403).json({ error: 'No tienes permisos para ver los pagos de este gasto.' });
      }
      
      // Obtener los pagos del gasto
      gastoModel.obtenerPagosPorGasto(id_gasto, (err, pagos) => {
        if (err) {
          console.error('Error al obtener pagos:', err);
          return res.status(500).json({ error: 'Error al obtener los pagos.' });
        }
        
        res.status(200).json({ 
          mensaje: 'Pagos obtenidos correctamente.',
          pagos: pagos || []
        });
      });
    });
  });
};

// Obtener pagos pendientes de un usuario en un grupo
const obtenerPagosPendientes = (req, res) => {
  const { id_grupo } = req.params;
  const id_usuario = req.usuario.id_usuario;
  
  if (!id_grupo || isNaN(id_grupo)) {
    return res.status(400).json({ error: 'ID de grupo no válido.' });
  }
  
  // Verificar que el usuario es miembro del grupo
  gruposModel.verificarMiembroGrupo(id_usuario, id_grupo, (err, memberResults) => {
    if (err) {
      console.error('Error al verificar membresía:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
    
    if (memberResults.length === 0) {
      return res.status(403).json({ error: 'No tienes permisos para ver los pagos de este grupo.' });
    }
    
    // Obtener los pagos del usuario en el grupo
    gastoModel.obtenerPagosPorUsuario(id_usuario, id_grupo, (err, pagos) => {
      if (err) {
        console.error('Error al obtener pagos:', err);
        return res.status(500).json({ error: 'Error al obtener los pagos.' });
      }
      
      res.status(200).json({ 
        mensaje: 'Pagos obtenidos correctamente.',
        pagos: pagos || []
      });
    });
  });
};

// =========== ANÁLISIS DE TICKETS CON IA ===========

// Analizar ticket con Gemini AI
const analizarTicket = async (req, res) => {
  try {
    const { imagen } = req.body;
    
    if (!imagen) {
      return res.status(400).json({ error: 'La imagen es requerida.' });
    }

    // Verificar que la API key esté configurada
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY no está configurada');
      return res.status(500).json({ error: 'Servicio de análisis no disponible.' });
    }

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Preparar la imagen (remover prefijo data:image si existe)
    let base64Image = imagen;
    let mimeType = 'image/jpeg';
    
    if (imagen.includes('data:image')) {
      const matches = imagen.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Image = matches[2];
      }
    }

    // Prompt estructurado para extraer items del ticket
    const prompt = `Analiza esta imagen de un ticket o recibo de compra.
Extrae los productos/items con su precio individual.
Límite máximo: 25 items.
Si hay propinas, impuestos o cargos adicionales, inclúyelos como items separados.

Responde ÚNICAMENTE con un JSON válido en este formato exacto, sin markdown ni texto adicional:
{
  "items": [
    {"concepto": "nombre del producto", "precio": 0.00}
  ],
  "total": 0.00
}

Reglas:
- Los precios deben ser números decimales (ej: 15.50)
- El concepto debe tener máximo 50 caracteres
- Si no puedes leer un precio, usa 0.00
- Si no hay items legibles, devuelve items vacío
- El total debe ser la suma de todos los items o el total del ticket si es visible`;

    // Enviar a Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    let text = response.text();
    
    // Limpiar respuesta (a veces Gemini agrega ```json)
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parsear JSON
    let ticketData;
    try {
      ticketData = JSON.parse(text);
    } catch (parseError) {
      console.error('Error al parsear respuesta de Gemini:', text);
      return res.status(422).json({ 
        error: 'No se pudo interpretar el ticket. Intenta con una foto más clara.',
        detalles: 'El formato de respuesta no es válido'
      });
    }

    // Validar estructura
    if (!ticketData.items || !Array.isArray(ticketData.items)) {
      ticketData.items = [];
    }

    // Sanitizar y limitar items
    ticketData.items = ticketData.items
      .slice(0, 25) // Máximo 25 items
      .map((item, index) => ({
        id: index + 1,
        concepto: String(item.concepto || 'Item sin nombre').substring(0, 50).trim(),
        precio: parseFloat(item.precio) || 0
      }))
      .filter(item => item.precio > 0 || item.concepto !== 'Item sin nombre');

    // Calcular total si no viene o recalcular
    const totalCalculado = ticketData.items.reduce((sum, item) => sum + item.precio, 0);
    ticketData.total = ticketData.total ? parseFloat(ticketData.total) : totalCalculado;

    res.status(200).json({
      mensaje: 'Ticket analizado correctamente.',
      items: ticketData.items,
      total: parseFloat(ticketData.total.toFixed(2)),
      totalCalculado: parseFloat(totalCalculado.toFixed(2))
    });

  } catch (error) {
    console.error('Error al analizar ticket:', error);
    
    if (error.message?.includes('API key')) {
      return res.status(500).json({ error: 'Error de configuración del servicio.' });
    }
    
    res.status(500).json({ 
      error: 'Error al analizar el ticket. Intenta de nuevo.',
      detalles: error.message 
    });
  }
};

module.exports = {
  // Categorías
  obtenerCategorias,
  crearCategoria,
  
  // Gastos
  crearGasto,
  obtenerGastosPorGrupo,
  obtenerDetalleGasto,
  actualizarGasto,
  eliminarGasto,
  marcarComoPagado,
  
  // Pagos Parciales
  realizarPagoParcial,
  obtenerPagosPorGasto,
  obtenerPagosPendientes,
  
  // Análisis de Tickets
  analizarTicket
};