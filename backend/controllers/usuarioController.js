const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');
require('dotenv').config(); 

// <summary>
// Controlador para la gestión de usuarios
// Manejo de base de datos en models/usuarioModel.js
// (Logica de la API)
//</summary>


// Registro de un nuevo usuario
const registrar = (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
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

            usuarioModel.crearUsuario(sanitizedNombre, sanitizedEmail, password_hash, (err, result) => {
                if (err) return res.status(500).json({ error: 'Error al registrar usuario.' });
                res.status(201).json({ mensaje: 'Usuario registrado correctamente.' });
            });
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

            // Devolver el token y datos del usuario
            res.status(200).json({ 
                mensaje: 'Login exitoso.', 
                token, 
                usuario: { 
                    id_usuario: usuario.id_usuario, 
                    nombre: usuario.nombre, 
                    email: usuario.email 
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
    res.json({ usuario: { id_usuario: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email, foto_perfil: usuario.foto_perfil } });
  });
};

// Actualizar perfil de usuario
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

  // Obtener la URL de la foto de perfil si se subió un archivo
  let fotoUrl = null;
  if (req.file) {
    // Construir la URL completa para acceder al archivo
    fotoUrl = `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}`;
  }

  if (!sanitizedNombre || !sanitizedEmail) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios.' });
  }

  // Verificar si el email ya existe para otro usuario
  usuarioModel.buscarPorEmail(sanitizedEmail, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
    
    // Si existe y no es el usuario actual
    if (results.length > 0 && results[0].id_usuario !== userId) {
      return res.status(409).json({ error: 'El email ya está en uso por otro usuario.' });
    }

    // Si se subió una nueva foto, se usa la nueva URL. Si no, se mantiene la existente.
    // Para esto, primero obtenemos el perfil actual.
    usuarioModel.findById(userId, (err, currentUser) => {
      if (err) return res.status(500).json({ error: 'Error al buscar usuario.' });
      if (currentUser.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

      const finalFotoUrl = fotoUrl || currentUser[0].foto_perfil;

      usuarioModel.updateProfile(userId, sanitizedNombre, sanitizedEmail, finalFotoUrl, (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar perfil.' });
        
        res.status(200).json({ 
          mensaje: 'Perfil actualizado correctamente.',
          usuario: { 
            id_usuario: userId, 
            nombre: sanitizedNombre, 
            email: sanitizedEmail,
            foto_perfil: finalFotoUrl
          }
        });
      });
    });
  });
};


module.exports = { registrar, mostrarTodos, login, validar, actualizarPerfil };