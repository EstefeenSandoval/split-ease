const bcrypt = require('bcryptjs');
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

    usuarioModel.buscarPorEmail(email, async (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
    if (results.length > 0) return res.status(409).json({ error: 'El email ya está registrado.' });

    const password_hash = await bcrypt.hash(password, 10);

    usuarioModel.crearUsuario(nombre, email, password_hash, (err, result) => {
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

    usuarioModel.buscarPorEmail(email, async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
        if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

        const usuario = results[0];
        const isMatch = await bcrypt.compare(password, usuario.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        res.status(200).json({ mensaje: 'Login exitoso.', usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
    });
};

const mostrarTodos = (req, res) => {
    usuarioModel.mostrarTodos((err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos.' });
        res.status(200).json(results);
    });
};

module.exports = { registrar, mostrarTodos , login };