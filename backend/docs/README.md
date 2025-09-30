# Documentación - Split Ease Backend

## Descripción
Split Ease es una aplicación web para gestionar gastos compartidos entre grupos de personas. Este backend proporciona una API REST completa para el manejo de usuarios, grupos y gastos.

## Tecnologías Utilizadas
- **Node.js** v16+
- **Express.js** - Framework web
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Encriptación de contraseñas
- **Multer** - Manejo de archivos
- **CORS** - Política de acceso

## Estructura del Proyecto
```
backend/
├── config/          # Configuración de base de datos
├── controllers/     # Lógica de negocio
├── middleware/      # Middlewares (auth, upload)
├── models/          # Modelos de datos
├── routes/          # Definición de rutas
├── public/          # Archivos estáticos
├── docs/            # Documentación
└── index.js         # Punto de entrada
```

## Índice de Documentación

### APIs
- [🔐 Autenticación y Usuarios](./api/usuarios.md) - Registro, login y gestión de usuarios
- [👥 Grupos](./api/grupos.md) - Creación y gestión de grupos
- [💰 Gastos](./api/gastos.md) - Gestión de gastos y categorías

### Base de Datos
- [🗄️ Esquema de Base de Datos](./database/schema.md) - Estructura de tablas y relaciones
- [📊 Datos de Ejemplo](./database/seed-data.md) - Datos iniciales y de prueba

### Despliegue
- [⚙️ Configuración e Instalación](./deployment/setup.md) - Guía de instalación y configuración
- [🔧 Variables de Entorno](./deployment/environment.md) - Configuración de variables

## Características Principales

### 🔐 Autenticación Segura
- Registro y login con JWT
- Middleware de autenticación
- Encriptación de contraseñas con bcrypt
- Validación de tokens

### 👥 Gestión de Grupos
- Creación de grupos con códigos de invitación
- Roles de administrador y miembro
- Invitación por código único
- Gestión de participantes

### 💰 Gestión de Gastos
- Creación de gastos con múltiples categorías
- División equitativa o personalizada
- Seguimiento de pagos
- Historial de gastos por grupo

### 📁 Manejo de Archivos
- Subida de fotos de perfil
- Almacenamiento seguro
- Validación de tipos de archivo

## Convenciones de la API

### Autenticación
Todos los endpoints (excepto registro y login) requieren:
```
Authorization: Bearer <JWT_TOKEN>
```

### Códigos de Respuesta
- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Solicitud incorrecta
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `409` - Conflicto (recurso duplicado)
- `500` - Error interno del servidor

### Formato de Respuestas
```json
{
  "mensaje": "Descripción de la operación",
  "data": { ... },  // Datos solicitados (opcional)
  "error": "..."    // Mensaje de error (opcional)
}
```

### Formato de Fechas
- Todas las fechas usan formato ISO 8601
- Ejemplo: `2025-09-25T14:30:00Z`

## URLs Base

### Desarrollo
- **API**: `http://localhost:3100/api`
- **Archivos**: `http://localhost:3100/public`

### Producción
- **API**: `https://tu-dominio.com/api`
- **Archivos**: `https://tu-dominio.com/public`

## Inicio Rápido

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno (ver [deployment/environment.md](./deployment/environment.md))

3. Configurar base de datos (ver [database/schema.md](./database/schema.md))

4. Ejecutar en desarrollo:
```bash
npm run dev
```

5. Ejecutar en producción:
```bash
npm start
```

## Seguridad

### Validación de Datos
- Sanitización de entradas
- Validación de formatos (email, etc.)
- Prevención de inyección SQL

### Autenticación
- Tokens JWT con expiración
- Verificación de permisos por endpoint
- Middleware de seguridad

### Archivos
- Validación de tipos permitidos
- Límites de tamaño
- Nombres únicos para evitar conflictos

---

**Versión**: 1.0.0  
**Última actualización**: Septiembre 2025  
**Puerto por defecto**: 3100