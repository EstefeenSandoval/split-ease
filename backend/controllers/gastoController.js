const gastoModel = require('../models/gastoModel');
const gruposModel = require('../models/gruposModel');

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
  const { id_grupo, descripcion, monto_total, id_categoria, fecha_gasto, participantes, tipo_division, moneda } = req.body;
  const id_pagador = req.usuario.id_usuario; // Del token JWT
  
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
  
  // Verificar que el usuario pertenece al grupo
  gruposModel.verificarMiembroGrupo(id_pagador, id_grupo, (err, results) => {
    if (err) {
      console.error('Error al verificar membresía:', err);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
    
    if (results.length === 0) {
      return res.status(403).json({ error: 'No tienes permisos para agregar gastos a este grupo.' });
    }
    
    // Crear el gasto
    gastoModel.crearGasto(
      id_grupo, 
      id_pagador, 
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
                res.status(201).json({ 
                  mensaje: 'Gasto creado correctamente.',
                  id_gasto: id_gasto 
                });
              }
            }
          );
        });
      }
    );
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
        
        res.status(200).json({ mensaje: 'Gasto actualizado correctamente.' });
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
  
  gastoModel.marcarDivisionComoPagada(id_gasto, id_usuario, (err, result) => {
    if (err) {
      console.error('Error al marcar como pagado:', err);
      return res.status(500).json({ error: 'Error al marcar como pagado.' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'División no encontrada.' });
    }
    
    res.status(200).json({ mensaje: 'Marcado como pagado correctamente.' });
  });
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
  marcarComoPagado
};
