const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const usuariosRoutes = require('./routes/usuario');
const gruposRoutes = require('./routes/grupos');
const gastosRoutes = require('./routes/gasto');
const dashboardRoutes = require('./routes/dashboard');
const notificacionesRoutes = require('./routes/notificaciones');
const PORT = process.env.PORT || 3100;

// Configuración de CORS para desarrollo y producción
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3100',
  'https://split-ease.up.railway.app'
];

app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política de CORS no permite el acceso desde este origen.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// === Rutas de la API ===
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// Servir archivos estáticos desde la carpeta 'public' del backend
app.use('/public', express.static(path.join(__dirname, 'public')));

// Servir archivos estáticos de la carpeta 'frontend/build'
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Cualquier ruta no reconocida por la API será manejada por React
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Levanta el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});