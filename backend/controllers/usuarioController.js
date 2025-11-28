const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');
const { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendProfileChangeVerificationEmail,
  generateVerificationToken 
} = require('../utils/emailHelper');
require('dotenv').config(); 

// <summary>
// Controlador para la gestión de usuarios
// Manejo de base de datos en models/usuarioModel.js
// (Logica de la API)
//</summary>


// Registro de un nuevo usuario (con verificación de email)
// Función para validar contraseña segura
const validarPasswordSegura = (password) => {
    if (password.length < 8) {
        return { valido: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valido: false, error: 'La contraseña debe tener al menos una letra mayúscula.' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { valido: false, error: 'La contraseña debe tener al menos un carácter especial (!@#$%^&*()_+-=[]{};\':"|,.<>/?).' };
    }
    return { valido: true };
};

const registrar = (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // Validar contraseña segura
    const validacionPassword = validarPasswordSegura(password);
    if (!validacionPassword.valido) {
        return res.status(400).json({ error: validacionPassword.error });
    }

    // Verificar si el email es valido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El email no es válido.' });
    }
        // Sanitización básica para evitar inyecciones SQL
        const sanitizedNombre = String(nombre).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').trim();
        const sanitizedEmail = String(email).replace(/[^a-zA-Z0-9@._-]/g, '').trim();
        const sanitizedPassword = String(password);

        if (!sanitizedNombre || !sanitizedEmail || !sanitizedPassword) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }

        if (!emailRegex.test(sanitizedEmail)) {
            return res.status(400).json({ error: 'El email no es válido.' });
        }

        usuarioModel.buscarPorEmail(sanitizedEmail, async (err, results) => {
            if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
            if (results.length > 0) return res.status(409).json({ error: 'El email ya está registrado.' });

            const password_hash = await bcrypt.hash(sanitizedPassword, 10);
            
            // Generar token de verificación (expira en 24 horas)
            const verificationToken = generateVerificationToken();
            const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

            usuarioModel.crearUsuarioConVerificacion(
                sanitizedNombre, 
                sanitizedEmail, 
                password_hash, 
                verificationToken,
                tokenExpira,
                async (err, result) => {
                    if (err) return res.status(500).json({ error: 'Error al registrar usuario.' });
                    
                    // Enviar email de verificación
                    const emailResult = await sendVerificationEmail(sanitizedEmail, sanitizedNombre, verificationToken);
                    
                    if (!emailResult.success) {
                        console.error('Error enviando email de verificación:', emailResult.error);
                    }
                    
                    res.status(201).json({ 
                        mensaje: 'Usuario registrado correctamente. Por favor, revisa tu correo para verificar tu cuenta.',
                        emailEnviado: emailResult.success
                    });
                }
            );
        });
    };

// Login de un usuario existente
const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    }

        // Sanitización básica
        const sanitizedEmail = String(email).replace(/[^a-zA-Z0-9@._-]/g, '').trim();
        const sanitizedPassword = String(password);

        if (!sanitizedEmail || !sanitizedPassword) {
            return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
        }

        usuarioModel.buscarPorEmail(sanitizedEmail, async (err, results) => {
            if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
            if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado o contraseña incorrecta.' });

            const usuario = results[0];
            const isMatch = await bcrypt.compare(sanitizedPassword, usuario.password_hash);

            if (!isMatch) {
                return res.status(401).json({ error: 'Usuario no encontrado o contraseña incorrecta.' });
            }

            // Generar token JWT
            const token = jwt.sign(
                { id_usuario: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email },
                process.env.JWT_SECRET || 'split-ease-secret',
                { expiresIn: '2h' }
            );

            // Actualizar la fecha de último acceso
            const currentDate = new Date();
            usuarioModel.updateDateAccess(usuario.id_usuario, currentDate, (err) => {
                if (err) console.error('Error al actualizar la fecha de último acceso:', err);
            });

            // Devolver el token y datos del usuario (incluyendo estado de verificación)
            res.status(200).json({ 
                mensaje: 'Login exitoso.', 
                token, 
                usuario: { 
                    id_usuario: usuario.id_usuario, 
                    nombre: usuario.nombre, 
                    email: usuario.email,
                    email_verificado: usuario.email_verificado === 1
                } 
            });
        });
};


// Mostrar todos los usuarios
const mostrarTodos = (req, res) => {
    usuarioModel.mostrarTodos((err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
        res.status(200).json(results);
    });
};

// Validar un usuario existente
const validar = (req, res) => {
  usuarioModel.findById(req.usuario.id_usuario, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
    if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const usuario = results[0];
    res.json({ 
      usuario: { 
        id_usuario: usuario.id_usuario, 
        nombre: usuario.nombre, 
        email: usuario.email, 
        foto_perfil: usuario.foto_perfil,
        email_verificado: usuario.email_verificado === 1
      } 
    });
  });
};

// Actualizar perfil de usuario (requiere verificación para cambios de nombre/email)
const actualizarPerfil = (req, res) => {
  // Extrae los datos del perfil del cuerpo de la solicitud
  const { nombre, email } = req.body;
  const userId = req.usuario.id_usuario;

  if (!nombre || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios.' });
  }

  // Verificar si el email es válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El email no es válido.' });
  }

  // Sanitización básica de nombre y email
  const sanitizedNombre = String(nombre).replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').trim();
  const sanitizedEmail = String(email).replace(/[^a-zA-Z0-9@._-]/g, '').trim();

  // Obtener la ruta de la foto de perfil si se subió un archivo
  // Guardar solo la ruta relativa, el frontend construirá la URL completa
  let fotoUrl = null;
  if (req.file) {
    fotoUrl = `/public/uploads/${req.file.filename}`;
  }

  if (!sanitizedNombre || !sanitizedEmail) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios.' });
  }

  // Obtener el usuario actual para verificar cambios
  usuarioModel.findById(userId, async (err, currentUser) => {
    if (err) return res.status(500).json({ error: 'Error al buscar usuario.' });
    if (currentUser.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const usuario = currentUser[0];

    // Verificar si el usuario tiene email verificado
    const emailVerificado = usuario.email_verificado === 1;

    // Verificar si hay cambios en nombre o email
    // Comparar sin sanitizar para detectar cambios reales
    const nombreCambiado = nombre.trim() !== usuario.nombre;
    const emailCambiado = email.trim().toLowerCase() !== usuario.email.toLowerCase();

    // Si el email no está verificado, no permitir cambios de nombre/email
    // Pero sí permitir cambios de foto
    if (!emailVerificado && (nombreCambiado || emailCambiado)) {
      // Si hay foto nueva, actualizarla aunque no se pueda cambiar nombre/email
      if (fotoUrl) {
        usuarioModel.updateProfilePhoto(userId, fotoUrl, (err) => {
          if (err) {
            console.error('Error actualizando foto:', err);
            return res.status(500).json({ error: 'Error al actualizar la foto de perfil.' });
          }
          return res.status(200).json({ 
            mensaje: 'Foto de perfil actualizada. Para cambiar tu nombre o email, primero verifica tu correo.',
            usuario: { 
              id_usuario: userId, 
              nombre: usuario.nombre, 
              email: usuario.email,
              foto_perfil: fotoUrl
            }
          });
        });
        return;
      }
      return res.status(403).json({ 
        error: 'Debes verificar tu email antes de poder cambiar tu nombre o email.',
        requiereVerificacion: true
      });
    }

    // Si hay cambios en nombre o email, requiere re-verificación
    if (nombreCambiado || emailCambiado) {
      // Verificar si el nuevo email ya existe para otro usuario
      if (emailCambiado) {
        const emailExistente = await new Promise((resolve) => {
          usuarioModel.buscarPorEmail(sanitizedEmail, (err, results) => {
            if (err) return resolve(null);
            resolve(results.length > 0 && results[0].id_usuario !== userId);
          });
        });
        
        if (emailExistente) {
          return res.status(409).json({ error: 'El email ya está en uso por otro usuario.' });
        }
      }

      // Generar token de verificación para cambio de perfil (24 horas)
      const changeToken = generateVerificationToken();
      const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000);

      usuarioModel.savePendingProfileChange(
        userId,
        nombreCambiado ? sanitizedNombre : null,
        emailCambiado ? sanitizedEmail : null,
        changeToken,
        tokenExpira,
        async (err) => {
          if (err) return res.status(500).json({ error: 'Error al guardar cambios pendientes.' });

          // Enviar email de confirmación
          const emailResult = await sendProfileChangeVerificationEmail(
            usuario.email, // Enviar al email actual
            usuario.nombre,
            changeToken,
            {
              nombreActual: usuario.nombre,
              nuevoNombre: nombreCambiado ? sanitizedNombre : null,
              emailActual: usuario.email,
              nuevoEmail: emailCambiado ? sanitizedEmail : null
            }
          );

          // Si también se cambió la foto, aplicar ese cambio inmediatamente
          // (la foto no requiere verificación)
          if (fotoUrl) {
            usuarioModel.updateProfilePhoto(userId, fotoUrl, (err) => {
              if (err) console.error('Error actualizando foto:', err);
            });
          }

          res.status(200).json({
            mensaje: 'Se ha enviado un correo de verificación para confirmar los cambios en tu perfil.',
            requiereVerificacion: true,
            emailEnviado: emailResult.success,
            usuario: {
              id_usuario: userId,
              nombre: usuario.nombre,
              email: usuario.email,
              foto_perfil: fotoUrl || usuario.foto_perfil
            }
          });
        }
      );
    } else {
      // Solo se cambió la foto (o no hubo cambios), aplicar directamente
      if (fotoUrl && fotoUrl !== usuario.foto_perfil) {
        usuarioModel.updateProfilePhoto(userId, fotoUrl, (err, result) => {
          if (err) return res.status(500).json({ error: 'Error al actualizar perfil.' });
          
          res.status(200).json({ 
            mensaje: 'Foto de perfil actualizada correctamente.',
            usuario: { 
              id_usuario: userId, 
              nombre: usuario.nombre, 
              email: usuario.email,
              foto_perfil: fotoUrl
            }
          });
        });
      } else {
        // No hubo ningún cambio real
        res.status(200).json({ 
          mensaje: 'No hubo cambios en el perfil.',
          usuario: { 
            id_usuario: userId, 
            nombre: usuario.nombre, 
            email: usuario.email,
            foto_perfil: usuario.foto_perfil
          }
        });
      }
    }
  });
};

// Obtener perfil del usuario actual
const obtenerPerfil = (req, res) => {
  const userId = req.usuario.id_usuario;

  usuarioModel.findById(userId, (err, results) => {
    if (err) {
      console.error('Error al obtener perfil:', err);
      return res.status(500).json({ error: 'Error al obtener perfil.' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const usuario = results[0];
    res.status(200).json({ 
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        foto_perfil: usuario.foto_perfil,
        fecha_registro: usuario.fecha_registro,
        activo: usuario.activo,
        email_verificado: usuario.email_verificado === 1
      }
    });
  });
};

// =====================================================
// VERIFICACIÓN DE EMAIL
// =====================================================

// Verificar email con token
const verificarEmail = (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ error: 'Token de verificación requerido.' });
  }

  // Primero intentar verificar directamente
  usuarioModel.verifyEmailByToken(token, (err, result) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
    
    // Si se afectó alguna fila, la verificación fue exitosa
    if (result.affectedRows > 0) {
      return res.status(200).json({ 
        mensaje: '¡Email verificado correctamente! Ya puedes acceder a todas las funciones.',
        verificado: true
      });
    }
    
    // Si no se afectó ninguna fila, el token es inválido o expirado
    return res.status(400).json({ 
      error: 'Token inválido o expirado.',
      tokenExpirado: true
    });
  });
};

// Reenviar email de verificación (con rate limit de 5 minutos)
const reenviarVerificacion = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email es obligatorio.' });
  }

  usuarioModel.buscarPorEmail(email, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const usuario = results[0];

    // Verificar si ya está verificado
    if (usuario.email_verificado === 1) {
      return res.status(400).json({ error: 'Este email ya está verificado.' });
    }

    // Verificar rate limit (5 minutos)
    usuarioModel.canResendVerification(usuario.id_usuario, (err, results) => {
      if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
      
      const { ultimo_reenvio_verificacion, minutos_transcurridos } = results[0];
      
      if (ultimo_reenvio_verificacion && minutos_transcurridos < 5) {
        const minutosRestantes = 5 - minutos_transcurridos;
        return res.status(429).json({ 
          error: `Debes esperar ${minutosRestantes} minuto(s) antes de solicitar otro reenvío.`,
          minutosRestantes
        });
      }

      // Generar nuevo token (24 horas)
      const newToken = generateVerificationToken();
      const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000);

      usuarioModel.updateVerificationToken(usuario.id_usuario, newToken, tokenExpira, async (err) => {
        if (err) return res.status(500).json({ error: 'Error al generar nuevo token.' });

        // Actualizar tiempo de último reenvío
        usuarioModel.updateLastResendTime(usuario.id_usuario, (err) => {
          if (err) console.error('Error al actualizar tiempo de reenvío:', err);
        });

        // Enviar email
        const emailResult = await sendVerificationEmail(usuario.email, usuario.nombre, newToken);

        if (!emailResult.success) {
          return res.status(500).json({ error: 'Error al enviar el email de verificación.' });
        }

        res.status(200).json({ 
          mensaje: 'Email de verificación reenviado correctamente.',
          emailEnviado: true
        });
      });
    });
  });
};

// =====================================================
// RECUPERACIÓN DE CONTRASEÑA
// =====================================================

// Solicitar recuperación de contraseña
const forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email es obligatorio.' });
  }

  const sanitizedEmail = String(email).replace(/[^a-zA-Z0-9@._-]/g, '').trim();

  usuarioModel.buscarPorEmail(sanitizedEmail, async (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
    
    // Por seguridad, siempre devolvemos el mismo mensaje aunque el usuario no exista
    if (results.length === 0) {
      return res.status(200).json({ 
        mensaje: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones.'
      });
    }

    const usuario = results[0];

    // Verificar que el email esté verificado
    if (usuario.email_verificado !== 1) {
      return res.status(403).json({ 
        error: 'Debes verificar tu email antes de poder recuperar tu contraseña.',
        requiereVerificacion: true
      });
    }

    // Generar token de reset (1 hora)
    const resetToken = generateVerificationToken();
    const tokenExpira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    usuarioModel.updateResetToken(usuario.id_usuario, resetToken, tokenExpira, async (err) => {
      if (err) return res.status(500).json({ error: 'Error al generar token de recuperación.' });

      // Enviar email
      const emailResult = await sendPasswordResetEmail(usuario.email, usuario.nombre, resetToken);

      res.status(200).json({ 
        mensaje: 'Si el email existe en nuestro sistema, recibirás un correo con instrucciones.',
        emailEnviado: emailResult.success
      });
    });
  });
};

// Restablecer contraseña con token
const resetPassword = (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token de recuperación requerido.' });
  }

  if (!password || !confirmPassword) {
    return res.status(400).json({ error: 'La nueva contraseña es obligatoria.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
  }

  // Validar contraseña segura
  const validacionPassword = validarPasswordSegura(password);
  if (!validacionPassword.valido) {
    return res.status(400).json({ error: validacionPassword.error });
  }

  usuarioModel.findByResetToken(token, async (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
    
    if (results.length === 0) {
      return res.status(400).json({ 
        error: 'Token inválido o expirado.',
        tokenExpirado: true
      });
    }

    // Hash de la nueva contraseña
    const newPasswordHash = await bcrypt.hash(password, 10);

    usuarioModel.resetPasswordByToken(token, newPasswordHash, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al restablecer contraseña.' });
      
      if (result.affectedRows === 0) {
        return res.status(400).json({ error: 'No se pudo restablecer la contraseña.' });
      }

      res.status(200).json({ 
        mensaje: '¡Contraseña restablecida correctamente! Ya puedes iniciar sesión.',
        exito: true
      });
    });
  });
};

// Validar token de reset (para verificar antes de mostrar formulario)
const validarTokenReset = (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ error: 'Token requerido.', valido: false });
  }

  usuarioModel.findByResetToken(token, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos.', valido: false });
    
    if (results.length === 0) {
      return res.status(400).json({ 
        error: 'Token inválido o expirado.',
        valido: false,
        tokenExpirado: true
      });
    }

    res.status(200).json({ 
      mensaje: 'Token válido.',
      valido: true
    });
  });
};

// =====================================================
// VERIFICACIÓN DE CAMBIOS DE PERFIL
// =====================================================

// Verificar cambios de perfil con token
const verificarCambioPerfil = (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ error: 'Token de verificación requerido.' });
  }

  usuarioModel.findByProfileChangeToken(token, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
    
    if (results.length === 0) {
      return res.status(400).json({ 
        error: 'Token inválido o expirado.',
        tokenExpirado: true
      });
    }

    const usuario = results[0];

    usuarioModel.applyPendingProfileChanges(token, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al aplicar cambios.' });
      
      if (result.affectedRows === 0) {
        return res.status(400).json({ error: 'No se pudieron aplicar los cambios.' });
      }

      res.status(200).json({ 
        mensaje: '¡Cambios aplicados correctamente!',
        exito: true,
        cambiosAplicados: {
          nombre: usuario.cambio_pendiente_nombre,
          email: usuario.cambio_pendiente_email
        }
      });
    });
  });
};


module.exports = { 
  registrar, 
  mostrarTodos, 
  login, 
  validar, 
  actualizarPerfil, 
  obtenerPerfil,
  // Verificación de email
  verificarEmail,
  reenviarVerificacion,
  // Recuperación de contraseña
  forgotPassword,
  resetPassword,
  validarTokenReset,
  // Cambios de perfil
  verificarCambioPerfil
};