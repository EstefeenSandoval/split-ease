// Importaciones necesarias
const usuarioController = require('../controllers/usuarioController');
const usuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');

// Crear mocks para las dependencias
jest.mock('../models/usuarioModel');
jest.mock('bcryptjs');

// Grupo de pruebas para el método registrar
describe('UsuarioController - Método registrar', () => {
  // Variables que usaremos en múltiples pruebas
  let req;
  let res;
  
  // Esta función se ejecuta antes de cada prueba
  beforeEach(() => {
    // Limpiamos todos los mocks para evitar interferencias entre pruebas
    jest.clearAllMocks();
    
    // Creamos objetos simulados de request y response
    req = {
      body: {
        nombre: 'Usuario Prueba',
        email: 'test@ejemplo.com',
        password: 'contraseña123'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(), // Esto permite encadenar .json()
      json: jest.fn()
    };
  });
  
  // PRUEBA 1: Validación de campos obligatorios
  test('debería retornar error 400 cuando faltan campos obligatorios', () => {
    // Caso 1: Sin nombre
    req.body = { email: 'test@ejemplo.com', password: 'contraseña123' };
    usuarioController.registrar(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Todos los campos son obligatorios.' });
    
    // Caso 2: Sin email
    jest.clearAllMocks();
    req.body = { nombre: 'Usuario Prueba', password: 'contraseña123' };
    usuarioController.registrar(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    
    // Caso 3: Sin contraseña
    jest.clearAllMocks();
    req.body = { nombre: 'Usuario Prueba', email: 'test@ejemplo.com' };
    usuarioController.registrar(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  
  // PRUEBA 2: Validación de formato de email
  test('debería retornar error 400 cuando el formato del email es inválido', () => {
    req.body.email = 'correo-invalido';
    usuarioController.registrar(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El email no es válido.' });
  });
  
  // PRUEBA 3: Sanitización de datos
  test('debería rechazar datos que se convierten en vacíos tras la sanitización', () => {
    req.body.nombre = '!@#$%^'; // Este nombre será sanitizado y quedará vacío
    usuarioController.registrar(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Todos los campos son obligatorios.' });
  });
  
  // PRUEBA 4: Error en la base de datos durante la búsqueda
  test('debería retornar error 500 cuando hay un error en la base de datos al buscar email', () => {
    // Simulamos un error en la función buscarPorEmail
    usuarioModel.buscarPorEmail.mockImplementation((email, callback) => {
      callback(new Error('Error simulado de base de datos'), null);
    });
    
    usuarioController.registrar(req, res);
    
    expect(usuarioModel.buscarPorEmail).toHaveBeenCalledWith('test@ejemplo.com', expect.any(Function));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error en la base de datos.' });
  });
  
  // PRUEBA 5: Email ya registrado
  test('debería retornar error 409 cuando el email ya está registrado', () => {
    // Simulamos que se encontró un usuario con ese email
    usuarioModel.buscarPorEmail.mockImplementation((email, callback) => {
      callback(null, [{ id_usuario: 1, email: 'test@ejemplo.com' }]);
    });
    
    usuarioController.registrar(req, res);
    
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'El email ya está registrado.' });
  });
  
  // PRUEBA 6: Error al crear usuario
  test('debería retornar error 500 cuando hay un error al crear el usuario', async () => {
    // Simulamos que no hay usuarios con ese email
    usuarioModel.buscarPorEmail.mockImplementation((email, callback) => {
      callback(null, []);
    });
    
    // Simulamos el hash de la contraseña
    bcrypt.hash.mockResolvedValue('password_hasheada');
    
    // Simulamos un error al crear el usuario
    usuarioModel.crearUsuario.mockImplementation((nombre, email, password, callback) => {
      callback(new Error('Error al crear usuario'), null);
    });
    
    await usuarioController.registrar(req, res);
    
    expect(bcrypt.hash).toHaveBeenCalledWith('contraseña123', 10);
    expect(usuarioModel.crearUsuario).toHaveBeenCalledWith(
      'Usuario Prueba', 
      'test@ejemplo.com', 
      'password_hasheada', 
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error al registrar usuario.' });
  });
  
  // PRUEBA 7: Registro exitoso
  test('debería registrar correctamente un usuario cuando todos los datos son válidos', async () => {
    // Simulamos que no hay usuarios con ese email
    usuarioModel.buscarPorEmail.mockImplementation((email, callback) => {
      callback(null, []);
    });
    
    // Simulamos el hash de la contraseña
    bcrypt.hash.mockResolvedValue('password_hasheada');
    
    // Simulamos una creación exitosa de usuario
    usuarioModel.crearUsuario.mockImplementation((nombre, email, password, callback) => {
      callback(null, { insertId: 1 });
    });
    
    await usuarioController.registrar(req, res);
    
    expect(usuarioModel.buscarPorEmail).toHaveBeenCalledWith('test@ejemplo.com', expect.any(Function));
    expect(bcrypt.hash).toHaveBeenCalledWith('contraseña123', 10);
    expect(usuarioModel.crearUsuario).toHaveBeenCalledWith(
      'Usuario Prueba', 
      'test@ejemplo.com', 
      'password_hasheada', 
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Usuario registrado correctamente.' });
  });
  
  // PRUEBA 8: Caracteres especiales en el nombre
  test('debería sanitizar correctamente el nombre con caracteres especiales', async () => {
    // Nombre con caracteres válidos y algunos especiales
    req.body.nombre = 'María José @#$% García';
    
    // Simulamos que no hay usuarios con ese email
    usuarioModel.buscarPorEmail.mockImplementation((email, callback) => {
      callback(null, []);
    });
    
    bcrypt.hash.mockResolvedValue('password_hasheada');
    
    usuarioModel.crearUsuario.mockImplementation((nombre, email, password, callback) => {
      callback(null, { insertId: 1 });
    });
    
    await usuarioController.registrar(req, res);
    
    // Verificamos que el nombre fue sanitizado correctamente
    expect(usuarioModel.crearUsuario).toHaveBeenCalledWith(
      'María José  García',  // Los caracteres especiales se eliminan
      'test@ejemplo.com', 
      'password_hasheada', 
      expect.any(Function)
    );
  });
});