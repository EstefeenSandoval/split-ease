const jwt = require('jsonwebtoken');
const gruposModel = require('../models/gruposModel');
const notificacionHelper = require('../utils/notificacionHelper');
require('dotenv').config();

// <summary>
// Controlador para la gestión de grupos
// Manejo de base de datos en models/gruposModel.js
// (Logica de la API)
//</summary>

// Función para generar código de invitación único
const generarCodigoInvitacion = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Crear un nuevo grupo
const crearGrupo = (req, res) => {
    const { nombre_grupo, descripcion } = req.body;
    const id_creador = req.usuario.id_usuario; // Obtenido del middleware de autenticación

    if (!nombre_grupo) {
        return res.status(400).json({ error: 'El nombre del grupo es obligatorio.' });
    }

    // Sanitización básica
    const sanitizedNombre = String(nombre_grupo).trim();
    const sanitizedDescripcion = descripcion ? String(descripcion).trim() : '';

    if (!sanitizedNombre) {
        return res.status(400).json({ error: 'El nombre del grupo es obligatorio.' });
    }

    const codigo_invitacion = generarCodigoInvitacion();

    gruposModel.crearGrupo(sanitizedNombre, sanitizedDescripcion, id_creador, codigo_invitacion, (err, result) => {
        if (err) {
            console.error('Error al crear grupo:', err);
            return res.status(500).json({ error: 'Error al crear el grupo.' });
        }

        const id_grupo = result.insertId;

        // Agregar al creador como administrador del grupo
        gruposModel.agregarParticipante(id_creador, id_grupo, 'administrador', (err, participanteResult) => {
            if (err) {
                console.error('Error al agregar participante:', err);
                return res.status(500).json({ error: 'Error al configurar el grupo.' });
            }

            res.status(201).json({ 
                mensaje: 'Grupo creado correctamente.',
                grupo: {
                    id_grupo: id_grupo,
                    nombre_grupo: sanitizedNombre,
                    descripcion: sanitizedDescripcion,
                    codigo_invitacion: codigo_invitacion
                }
            });
        });
    });
};

// Obtener grupos del usuario
const obtenerGrupos = (req, res) => {
    const id_usuario = req.usuario.id_usuario;

    gruposModel.obtenerGruposPorUsuario(id_usuario, (err, results) => {
        if (err) {
            console.error('Error al obtener grupos:', err);
            return res.status(500).json({ error: 'Error al obtener los grupos.' });
        }

        res.status(200).json({ grupos: results });
    });
};

// Obtener grupo por ID
const obtenerGrupoPorId = (req, res) => {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID de grupo inválido.' });
    }

    // Verificar que el usuario es miembro del grupo
    gruposModel.verificarMiembroGrupo(id_usuario, id, (err, memberResults) => {
        if (err) {
            console.error('Error al verificar membresía:', err);
            return res.status(500).json({ error: 'Error al verificar acceso al grupo.' });
        }

        if (memberResults.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a este grupo.' });
        }

        gruposModel.obtenerGrupoPorId(id, (err, results) => {
            if (err) {
                console.error('Error al obtener grupo:', err);
                return res.status(500).json({ error: 'Error al obtener el grupo.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Grupo no encontrado.' });
            }

            res.status(200).json({ grupo: results[0] });
        });
    });
};

// Actualizar grupo
const actualizarGrupo = (req, res) => {
    const { id } = req.params;
    const { nombre_grupo, descripcion } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID de grupo inválido.' });
    }

    if (!nombre_grupo) {
        return res.status(400).json({ error: 'El nombre del grupo es obligatorio.' });
    }

    // Sanitización básica
    const sanitizedNombre = String(nombre_grupo).trim();
    const sanitizedDescripcion = descripcion ? String(descripcion).trim() : '';

    // Verificar que el usuario es miembro del grupo (preferiblemente administrador)
    gruposModel.verificarMiembroGrupo(id_usuario, id, (err, memberResults) => {
        if (err) {
            console.error('Error al verificar membresía:', err);
            return res.status(500).json({ error: 'Error al verificar acceso al grupo.' });
        }

        if (memberResults.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a este grupo.' });
        }

        gruposModel.actualizarGrupo(id, sanitizedNombre, sanitizedDescripcion, (err, result) => {
            if (err) {
                console.error('Error al actualizar grupo:', err);
                return res.status(500).json({ error: 'Error al actualizar el grupo.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Grupo no encontrado.' });
            }

            // Devolver el grupo actualizado
            res.status(200).json({ 
                mensaje: 'Grupo actualizado correctamente.',
                grupo: {
                    id_grupo: id,
                    nombre_grupo: sanitizedNombre,
                    descripcion: sanitizedDescripcion
                }
            });
        });
    });
};

// Eliminar grupo
const eliminarGrupo = (req, res) => {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID de grupo inválido.' });
    }

    // Verificar que el usuario es el creador del grupo
    gruposModel.obtenerGrupoPorId(id, (err, results) => {
        if (err) {
            console.error('Error al obtener grupo:', err);
            return res.status(500).json({ error: 'Error al verificar el grupo.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Grupo no encontrado.' });
        }

        if (results[0].id_creador !== id_usuario) {
            return res.status(403).json({ error: 'Solo el creador del grupo puede eliminarlo.' });
        }

        gruposModel.eliminarGrupo(id, (err, result) => {
            if (err) {
                console.error('Error al eliminar grupo:', err);
                return res.status(500).json({ error: 'Error al eliminar el grupo.' });
            }

            res.status(200).json({ mensaje: 'Grupo eliminado correctamente.' });
        });
    });
};

// Eliminar participante del grupo
const eliminarParticipante = (req, res) => {
    const { id_grupo, id_usuario_eliminar } = req.params;
    const id_usuario_solicitante = req.usuario.id_usuario;

    if (!id_grupo || isNaN(id_grupo) || !id_usuario_eliminar || isNaN(id_usuario_eliminar)) {
        return res.status(400).json({ error: 'IDs de grupo y usuario son inválidos.' });
    }

    // Verificar que el usuario solicitante es miembro del grupo
    gruposModel.verificarMiembroGrupo(id_usuario_solicitante, id_grupo, (err, memberResults) => {
        if (err) {
            console.error('Error al verificar membresía:', err);
            return res.status(500).json({ error: 'Error al verificar acceso al grupo.' });
        }

        if (memberResults.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a este grupo.' });
        }

        // Verificar si el usuario solicitante es administrador o si es el mismo usuario que se quiere eliminar
        const esAdministrador = memberResults[0].rol === 'administrador';
        const esMismoUsuario = id_usuario_solicitante == id_usuario_eliminar;

        if (!esAdministrador && !esMismoUsuario) {
            return res.status(403).json({ error: 'Solo los administradores pueden eliminar otros participantes.' });
        }

        // Verificar que el usuario a eliminar es miembro del grupo
        gruposModel.verificarMiembroGrupo(id_usuario_eliminar, id_grupo, (err, targetMemberResults) => {
            if (err) {
                console.error('Error al verificar membresía del usuario objetivo:', err);
                return res.status(500).json({ error: 'Error al verificar el usuario objetivo.' });
            }

            if (targetMemberResults.length === 0) {
                return res.status(404).json({ error: 'El usuario no es miembro de este grupo.' });
            }

            // Verificar que no sea el creador del grupo (no se puede eliminar al creador)
            gruposModel.obtenerGrupoPorId(id_grupo, (err, grupoResults) => {
                if (err) {
                    console.error('Error al obtener grupo:', err);
                    return res.status(500).json({ error: 'Error al verificar el grupo.' });
                }

                if (grupoResults.length === 0) {
                    return res.status(404).json({ error: 'Grupo no encontrado.' });
                }

                if (grupoResults[0].id_creador == id_usuario_eliminar) {
                    return res.status(400).json({ error: 'No se puede eliminar al creador del grupo.' });
                }

                // Proceder con la eliminación del participante
                gruposModel.eliminarParticipante(id_usuario_eliminar, id_grupo, (err, result) => {
                    if (err) {
                        console.error('Error al eliminar participante:', err);
                        return res.status(500).json({ error: 'Error al eliminar el participante.' });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'No se pudo eliminar el participante.' });
                    }

                    res.status(200).json({ mensaje: 'Participante eliminado correctamente del grupo.' });
                });
            });
        });
    });
};

// Obtener participantes del grupo
const obtenerParticipantes = (req, res) => {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID de grupo inválido.' });
    }

    // Verificar que el usuario es miembro del grupo
    gruposModel.verificarMiembroGrupo(id_usuario, id, (err, memberResults) => {
        if (err) {
            console.error('Error al verificar membresía:', err);
            return res.status(500).json({ error: 'Error al verificar acceso al grupo.' });
        }

        if (memberResults.length === 0) {
            return res.status(403).json({ error: 'No tienes acceso a este grupo.' });
        }

        gruposModel.obtenerParticipantesGrupo(id, (err, results) => {
            if (err) {
                console.error('Error al obtener participantes:', err);
                return res.status(500).json({ error: 'Error al obtener los participantes.' });
            }

            res.status(200).json({ participantes: results });
        });
    });
};

// Unirse a un grupo por código de invitación
const unirseAlGrupo = (req, res) => {
    const { codigo_invitacion } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!codigo_invitacion) {
        return res.status(400).json({ error: 'El código de invitación es obligatorio.' });
    }

    const sanitizedCodigo = String(codigo_invitacion).trim();

    gruposModel.buscarPorCodigoInvitacion(sanitizedCodigo, (err, grupoResults) => {
        if (err) {
            console.error('Error al buscar grupo:', err);
            return res.status(500).json({ error: 'Error al buscar el grupo.' });
        }

        if (grupoResults.length === 0) {
            return res.status(404).json({ error: 'Código de invitación inválido o grupo no encontrado.' });
        }

        const grupo = grupoResults[0];

        // Verificar si el usuario ya es miembro del grupo
        gruposModel.verificarMiembroGrupo(id_usuario, grupo.id_grupo, (err, memberResults) => {
            if (err) {
                console.error('Error al verificar membresía:', err);
                return res.status(500).json({ error: 'Error al verificar membresía.' });
            }

            if (memberResults.length > 0) {
                return res.status(409).json({ error: 'Ya eres miembro de este grupo.' });
            }

            // Agregar al usuario como miembro del grupo
            gruposModel.agregarParticipante(id_usuario, grupo.id_grupo, 'miembro', (err, result) => {
                if (err) {
                    console.error('Error al agregar participante:', err);
                    return res.status(500).json({ error: 'Error al unirse al grupo.' });
                }

                // Obtener información del usuario para las notificaciones
                const db = require('../config/db');
                db.query('SELECT nombre FROM USUARIOS WHERE id_usuario = ?', [id_usuario], (err, usuarioResults) => {
                    const nombreUsuario = usuarioResults && usuarioResults[0] ? usuarioResults[0].nombre : 'Un usuario';
                    
                    // Notificar al nuevo miembro
                    notificacionHelper.notificarNuevoMiembro(
                        id_usuario,
                        grupo.nombre_grupo,
                        grupo.id_grupo,
                        (err) => {
                            if (err) console.error('Error al notificar nuevo miembro:', err);
                        }
                    );

                    // Obtener todos los participantes del grupo (excepto el nuevo miembro)
                    gruposModel.obtenerParticipantesGrupo(grupo.id_grupo, (err, participantes) => {
                        if (!err && participantes && participantes.length > 0) {
                            const idsParticipantes = participantes
                                .filter(p => p.id_usuario !== id_usuario)
                                .map(p => p.id_usuario);
                            
                            // Notificar a los demás miembros sobre el nuevo integrante
                            if (idsParticipantes.length > 0) {
                                notificacionHelper.notificarGrupoNuevoMiembro(
                                    idsParticipantes,
                                    nombreUsuario,
                                    grupo.nombre_grupo,
                                    grupo.id_grupo,
                                    (err) => {
                                        if (err) console.error('Error al notificar grupo sobre nuevo miembro:', err);
                                    }
                                );
                            }
                        }
                    });
                });

                res.status(200).json({ 
                    mensaje: 'Te has unido al grupo correctamente.',
                    grupo: {
                        id_grupo: grupo.id_grupo,
                        nombre_grupo: grupo.nombre_grupo,
                        descripcion: grupo.descripcion
                    }
                });
            });
        });
    });
};

module.exports = { 
    crearGrupo, 
    obtenerGrupos, 
    obtenerGrupoPorId, 
    actualizarGrupo, 
    eliminarGrupo, 
    eliminarParticipante, 
    obtenerParticipantes, 
    unirseAlGrupo 
};

