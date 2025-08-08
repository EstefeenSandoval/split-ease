const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const usuariosRoutes = require('./routes/usuarios');
const PORT = process.env.PORT || 3100;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));


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