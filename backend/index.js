const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3100;

// Importa las rutas
const usuariosRoutes = require('./routes/usuarios');


app.use(express.json());

// === Rutas de la API ===
app.use('/api/usuarios', usuariosRoutes);

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