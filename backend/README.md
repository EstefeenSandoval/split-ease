# Split Ease - Backend

## 📋 Descripción
Backend de Split Ease, una aplicación web para gestionar gastos compartidos entre grupos de personas. Proporciona una API REST completa desarrollada con Node.js, Express y MySQL.

## 🚀 Características Principales

- **Autenticación JWT** - Sistema seguro de login y registro
- **Gestión de Grupos** - Creación y administración de grupos con códigos de invitación
- **Gestión de Gastos** - Registro, división y seguimiento de gastos compartidos
- **Manejo de Archivos** - Subida de fotos de perfil
- **API RESTful** - Endpoints bien documentados y organizados
- **Base de Datos MySQL** - Esquema normalizado y optimizado

## 🛠️ Tecnologías

- **Node.js** v16+
- **Express.js** - Framework web
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Encriptación
- **Multer** - Manejo de archivos
- **CORS** - Política de acceso

## 📁 Estructura del Proyecto

```
backend/
├── config/                 # Configuración
│   └── db.js              # Conexión MySQL
├── controllers/           # Lógica de negocio
│   ├── usuarioController.js
│   ├── gruposController.js
│   └── gastoController.js
├── middleware/            # Middlewares
│   ├── auth.js           # Autenticación JWT
│   └── upload.js         # Subida de archivos
├── models/               # Modelos de datos
│   ├── usuarioModel.js
│   ├── gruposModel.js
│   └── gastoModel.js
├── routes/               # Definición de rutas
│   ├── usuario.js
│   ├── grupos.js
│   └── gasto.js
├── public/               # Archivos estáticos
│   └── uploads/         # Fotos subidas
├── docs/                # Documentación
│   ├── README.md        # Este archivo
│   ├── api/            # Documentación de APIs
│   ├── database/       # Esquema y datos
│   └── deployment/     # Instalación y configuración
├── .env                 # Variables de entorno
├── index.js            # Punto de entrada
└── package.json        # Dependencias
```

## ⚡ Inicio Rápido

### 1. Instalación
```bash
git clone https://github.com/EstefeenSandoval/split-ease.git
cd split-ease/backend
npm install
```

### 2. Configuración Base de Datos
```sql
CREATE DATABASE split_ease CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
mysql -u usuario -p split_ease < ../database/data.sql
```

### 3. Variables de Entorno
```bash
# Crear archivo .env
cp .env.example .env
# Editar con tus valores
```

### 4. Ejecutar
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📖 Documentación Completa

### 🔗 Enlaces Rápidos
- **[📋 Documentación Principal](./docs/README.md)**
- **[🔐 API de Usuarios](./docs/api/usuarios.md)**
- **[👥 API de Grupos](./docs/api/grupos.md)**
- **[💰 API de Gastos](./docs/api/gastos.md)**
- **[🗄️ Esquema de BD](./docs/database/schema.md)**
- **[⚙️ Instalación](./docs/deployment/setup.md)**
- **[🔧 Variables de Entorno](./docs/deployment/environment.md)**

### 📚 Documentación de APIs

#### 🔐 Usuarios y Autenticación (`/api/usuarios`)
- `POST /registro` - Registrar nuevo usuario
- `POST /login` - Iniciar sesión
- `GET /validar` - Validar token JWT
- `GET /mostrar` - Listar usuarios
- `PUT /perfil` - Actualizar perfil y foto

#### 👥 Grupos (`/api/grupos`)
- `POST /crear` - Crear nuevo grupo
- `GET /mostrar` - Obtener grupos del usuario
- `GET /:id` - Obtener detalles de grupo
- `PUT /:id` - Actualizar grupo
- `DELETE /:id` - Eliminar grupo
- `GET /:id/participantes` - Ver participantes
- `DELETE /:id_grupo/participantes/:id_usuario` - Eliminar participante
- `POST /unirse` - Unirse con código de invitación

#### 💰 Gastos (`/api/gastos`)
- `GET /categorias` - Obtener categorías
- `POST /categorias` - Crear categoría
- `POST /` - Crear gasto
- `GET /grupo/:id_grupo` - Gastos de un grupo
- `GET /:id_gasto` - Detalle de gasto
- `PUT /:id_gasto` - Actualizar gasto
- `DELETE /:id_gasto` - Eliminar gasto
- `PUT /:id_gasto/pagar` - Marcar como pagado

## 🔒 Seguridad

### Autenticación
- Tokens JWT con expiración de 2 horas
- Middleware de verificación en rutas protegidas
- Contraseñas encriptadas con bcrypt

### Validación
- Sanitización de entradas de usuario
- Validación de formatos (email, etc.)
- Prevención de inyección SQL

### Archivos
- Tipos permitidos: JPG, PNG
- Tamaño máximo: 5MB
- Nombres únicos con timestamp

## 🗄️ Base de Datos

### Tablas Principales
- **USUARIOS** - Información de usuarios
- **GRUPOS** - Grupos de gastos compartidos
- **PARTICIPANTES_GRUPO** - Relación usuarios-grupos
- **GASTOS** - Registro de gastos
- **DIVISIONES_GASTO** - División de gastos entre usuarios
- **CATEGORIAS** - Categorías de gastos
- **PAGOS** - Historial de pagos
- **NOTIFICACIONES** - Sistema de notificaciones

### Características de BD
- Motor InnoDB para integridad referencial
- Codificación UTF8MB4 completa
- Índices optimizados para consultas frecuentes
- Restricciones de clave foránea configuradas

## 🌐 Endpoints Principales

### Base URL: `http://localhost:3100/api`

#### Autenticación Requerida
```javascript
// Headers para rutas protegidas
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

#### Respuestas Estándar
```javascript
// Éxito
{
  "mensaje": "Operación exitosa",
  "data": { ... }
}

// Error
{
  "error": "Descripción del error"
}
```

## 🚦 Estados de Respuesta

- `200` - OK
- `201` - Creado
- `400` - Solicitud incorrecta
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `409` - Conflicto
- `500` - Error del servidor

## 🔧 Scripts Disponibles

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start

# Ejecutar tests
npm test

# Validar variables de entorno
node scripts/validate-env.js
```

## 📦 Dependencias Principales

```json
{
  "express": "^4.19.2",
  "mysql2": "^3.14.3",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^3.0.2",
  "multer": "^2.0.2",
  "cors": "^2.8.5",
  "dotenv": "^17.2.1"
}
```

## 🔗 URLs de Desarrollo

- **API Backend**: http://localhost:3100
- **Frontend**: http://localhost:3000
- **Archivos**: http://localhost:3100/public/uploads/

## 📝 Variables de Entorno Requeridas

```env
# Base de datos
DB_HOST=localhost
DB_USER=split_ease_user  
DB_PASSWORD=tu_password
DB_NAME=split_ease

# JWT
JWT_SECRET=tu_clave_secreta_jwt

# Servidor
PORT=3100
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: [Estefeen Sandoval](https://github.com/EstefeenSandoval)

## 🐛 Reportar Problemas

Si encuentras algún problema, por favor [crea un issue](https://github.com/EstefeenSandoval/split-ease/issues) en GitHub.

## 📞 Soporte

Para soporte adicional:
- 📧 Email: soporte@splitease.com
- 💬 GitHub Issues: https://github.com/EstefeenSandoval/split-ease/issues

---

**Versión**: 1.0.0  
**Última actualización**: Septiembre 2025  
**Node.js**: v16+ requerido  
**Puerto por defecto**: 3100