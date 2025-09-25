# Configuración e Instalación - Split Ease Backend

## Requisitos del Sistema

### Software Requerido
- **Node.js**: v16.0 o superior
- **npm**: v8.0 o superior (incluido con Node.js)
- **MySQL**: v5.7 o superior / MariaDB v10.2 o superior
- **Git**: Para clonar el repositorio

### Sistema Operativo
- Windows 10/11
- macOS 10.15 o superior
- Linux (Ubuntu 18.04+, CentOS 7+, etc.)

## Instalación Paso a Paso

### 1. Clonar el Repositorio
```bash
git clone https://github.com/EstefeenSandoval/split-ease.git
cd split-ease/backend
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Base de Datos

#### Crear Base de Datos
```sql
-- Conectarse a MySQL como administrador
mysql -u root -p

-- Crear base de datos
CREATE DATABASE split_ease CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario (opcional pero recomendado)
CREATE USER 'split_ease_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON split_ease.* TO 'split_ease_user'@'localhost';
FLUSH PRIVILEGES;

-- Salir de MySQL
EXIT;
```

#### Importar Esquema
```bash
# Desde la carpeta raíz del proyecto
mysql -u split_ease_user -p split_ease < database/data.sql
```

### 4. Configurar Variables de Entorno

Crear archivo `.env` en la carpeta `backend/`:
```bash
cp .env.example .env  # Si existe el archivo de ejemplo
# O crear nuevo archivo .env
```

Contenido del archivo `.env`:
```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=split_ease_user
DB_PASSWORD=tu_password_seguro
DB_NAME=split_ease

# Configuración JWT
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura_aqui

# Configuración del Servidor
PORT=3100
NODE_ENV=development

# Configuración CORS (opcional)
FRONTEND_URL=http://localhost:3000
```

### 5. Verificar Instalación
```bash
# Modo desarrollo
npm run dev

# O modo producción
npm start
```

**Salida esperada:**
```
Servidor corriendo en http://localhost:3100
```

## Estructura de Archivos

```
backend/
├── config/
│   └── db.js              # Configuración de MySQL
├── controllers/
│   ├── usuarioController.js
│   ├── gruposController.js
│   └── gastoController.js
├── middleware/
│   ├── auth.js            # Middleware JWT
│   └── upload.js          # Middleware de archivos
├── models/
│   ├── usuarioModel.js
│   ├── gruposModel.js
│   └── gastoModel.js
├── routes/
│   ├── usuario.js
│   ├── grupos.js
│   └── gasto.js
├── public/
│   └── uploads/           # Archivos subidos
├── docs/                  # Documentación
├── .env                   # Variables de entorno
├── index.js              # Punto de entrada
└── package.json          # Dependencias y scripts
```

## Scripts Disponibles

```bash
# Desarrollo con recarga automática
npm run dev

# Producción
npm start

# Ejecutar tests (si están configurados)
npm test
```

## Configuración de Desarrollo

### Nodemon (incluido)
Para desarrollo con recarga automática:
```bash
npm install -g nodemon  # Instalación global (opcional)
npm run dev             # Usa nodemon localmente
```

### Variables de Entorno de Desarrollo
```env
NODE_ENV=development
PORT=3100
DB_HOST=localhost
DB_USER=split_ease_user
DB_PASSWORD=password123
DB_NAME=split_ease_dev
JWT_SECRET=desarrollo_secret_key_no_usar_en_produccion
FRONTEND_URL=http://localhost:3000
```

## Configuración de Producción

### Variables de Entorno de Producción
```env
NODE_ENV=production
PORT=3100
DB_HOST=tu_host_produccion
DB_USER=usuario_produccion
DB_PASSWORD=password_super_seguro
DB_NAME=split_ease_prod
JWT_SECRET=clave_jwt_super_secreta_y_larga_para_produccion
FRONTEND_URL=https://tu-dominio.com
```

### Proceso Manager (PM2)
Para ejecutar en producción con PM2:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Crear archivo ecosystem.config.js
module.exports = {
  apps: [{
    name: 'split-ease-backend',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3100
    }
  }]
};

# Ejecutar con PM2
pm2 start ecosystem.config.js --env production
```

## Configuración de Base de Datos

### MySQL/MariaDB
```sql
-- Configuraciones recomendadas en my.cnf o my.ini

[mysql]
default-character-set = utf8mb4

[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
innodb_file_per_table = 1
innodb_buffer_pool_size = 256M
max_connections = 100
```

### Pool de Conexiones
El sistema usa un pool de conexiones configurado en `config/db.js`:
```javascript
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,        // Máximo 10 conexiones simultáneas
  acquireTimeout: 60000,      // Timeout de 60 segundos
  timeout: 60000,
  reconnect: true
});
```

## Configuración de Archivos

### Carpeta de Uploads
```bash
# Crear carpeta si no existe
mkdir -p backend/public/uploads
chmod 755 backend/public/uploads
```

### Límites de Archivos
Configurado en `middleware/upload.js`:
- **Tipos permitidos**: .jpg, .jpeg, .png
- **Tamaño máximo**: 5MB por archivo
- **Nombrado**: Timestamp único + extensión original

## Configuración de Seguridad

### CORS
```javascript
// En index.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### JWT
```javascript
// Configuración recomendada
{
  expiresIn: '2h',           // Tokens expiran en 2 horas
  algorithm: 'HS256',        // Algoritmo de firma
  issuer: 'split-ease',      // Emisor del token
}
```

### Variables Secretas
**IMPORTANTE**: Generar claves seguras para producción:
```bash
# Generar JWT_SECRET seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Solución de Problemas Comunes

### Error de Conexión a MySQL
```bash
# Verificar que MySQL esté ejecutándose
systemctl status mysql        # Linux
brew services list mysql      # macOS
net start mysql              # Windows

# Verificar credenciales
mysql -u split_ease_user -p split_ease
```

### Error de Permisos en Uploads
```bash
# Linux/macOS
chmod -R 755 backend/public/uploads
chown -R node:node backend/public/uploads

# Windows (ejecutar como administrador)
icacls "backend\public\uploads" /grant Everyone:F
```

### Puerto en Uso
```bash
# Verificar qué proceso usa el puerto 3100
netstat -tulpn | grep 3100    # Linux
lsof -i :3100                 # macOS
netstat -ano | findstr :3100  # Windows

# Cambiar puerto en .env
PORT=3101
```

### Problemas de Dependencias
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## Verificación de la Instalación

### Test de Endpoints
```bash
# Test de salud del servidor
curl http://localhost:3100/api/usuarios/mostrar

# Debería devolver error 401 (sin token)
```

### Test de Base de Datos
```sql
-- Verificar tablas creadas
USE split_ease;
SHOW TABLES;

-- Verificar categorías iniciales
SELECT * FROM CATEGORIAS;
```

### Logs del Sistema
```bash
# Ver logs en tiempo real
tail -f /var/log/mysql/error.log    # MySQL logs
pm2 logs split-ease-backend         # PM2 logs (si aplica)
```

---

**Puerto por defecto**: 3100  
**Archivo de configuración**: `.env`  
**Base de datos**: `split_ease`  
**Documentación completa**: `/docs/README.md`