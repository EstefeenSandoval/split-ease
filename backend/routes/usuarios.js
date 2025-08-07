const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

router.post('/registro', usuariosController.registrar);

router.post('/login', usuariosController.login);

router.get('/mostrar', usuariosController.mostrarTodos);


module.exports = router;