const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');

const registrar = (req, res) => {
    const { nombre, email, password } = req.body;
    
    //console.log('Datos recibidos:', { nombre, email, password });

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // Verificar si el email es valido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El email no es válido.' });
    }



        // Sanitización básica
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
            if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

            const usuario = results[0];
            const isMatch = await bcrypt.compare(sanitizedPassword, usuario.password_hash);

            if (!isMatch) {
                return res.status(401).json({ error: 'Contraseña incorrecta.' });
            }

            // Generar token JWT
            const token = jwt.sign(
                { id_usuario: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email },
                process.env.JWT_SECRET || 'split-ease-secret',
                { expiresIn: '2h' }
            );

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



const mostrarTodos = (req, res) => {
    usuarioModel.mostrarTodos((err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
        res.status(200).json(results);
    });
};

const validar = (req, res) => {
  usuarioModel.findById(req.usuario.id_usuario, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
    if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const usuario = results[0];
    res.json({ usuario: { id_usuario: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email } });
  });
};


module.exports = { registrar, mostrarTodos, login, validar };