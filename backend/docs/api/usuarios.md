# API de Usuarios y Autenticación - Split Ease

## Descripción
Esta API gestiona la autenticación de usuarios, registro, login y perfil de usuario. Utiliza JWT para la autenticación y bcrypt para la encriptación de contraseñas.

## Base URL
```
/api/usuarios
```

## Endpoints Disponibles

### Registro de Usuario

#### `POST /api/usuarios/registro`
Registra un nuevo usuario en el sistema.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "contraseñaSegura123"
}
```

**Validaciones:**
- `nombre`: Requerido, solo letras y espacios
- `email`: Requerido, formato válido de email
- `password`: Requerido, mínimo 6 caracteres

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Usuario registrado correctamente."
}
```

**Errores posibles:**
- `400`: Campos faltantes o inválidos
- `409`: Email ya registrado
- `500`: Error interno del servidor

---

### Inicio de Sesión

#### `POST /api/usuarios/login`
Autentica un usuario existente y devuelve un token JWT.

**Body:**
```json
{
  "email": "juan@ejemplo.com",
  "password": "contraseñaSegura123"
}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Login exitoso.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com"
  }
}
```

**Detalles del Token:**
- **Algoritmo**: HS256
- **Expiración**: 2 horas
- **Contenido**: `{ id_usuario, nombre, email }`

**Errores posibles:**
- `400`: Campos faltantes
- `401`: Credenciales incorrectas
- `404`: Usuario no encontrado
- `500`: Error interno del servidor

---

### Validación de Token

#### `GET /api/usuarios/validar`
Valida el token JWT y devuelve información del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "usuario": {
    "id_usuario": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "foto_perfil": "http://localhost:3100/public/uploads/foto_perfil-123456.jpg"
  }
}
```

**Errores posibles:**
- `401`: Token inválido o expirado
- `404`: Usuario no encontrado
- `500`: Error interno del servidor

---

### Listar Usuarios

#### `GET /api/usuarios/mostrar`
Obtiene la lista de todos los usuarios registrados (protegido).

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
[
  {
    "id_usuario": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "fecha_registro": "2025-09-25T10:00:00Z",
    "ultimo_login": "2025-09-25T14:30:00Z",
    "foto_perfil": "http://localhost:3100/public/uploads/foto_perfil-123456.jpg"
  }
]
```

---

### Actualizar Perfil

#### `PUT /api/usuarios/perfil`
Actualiza el perfil del usuario autenticado, incluyendo foto de perfil.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (multipart/form-data):**
```
nombre: "Juan Carlos Pérez"
email: "juancarlos@ejemplo.com"
foto_perfil: [archivo de imagen]
```

**Tipos de archivo permitidos:**
- `.jpg`, `.jpeg`, `.png`
- Tamaño máximo: 5MB
- Se genera nombre único automáticamente

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Perfil actualizado correctamente.",
  "usuario": {
    "id_usuario": 1,
    "nombre": "Juan Carlos Pérez",
    "email": "juancarlos@ejemplo.com",
    "foto_perfil": "http://localhost:3100/public/uploads/foto_perfil-1234567890.jpg"
  }
}
```

**Errores posibles:**
- `400`: Campos inválidos o archivo no permitido
- `401`: Token inválido
- `409`: Email ya en uso por otro usuario
- `500`: Error interno del servidor

---

## Middleware de Autenticación

### Verificación de Token
```javascript
// Header requerido
Authorization: Bearer <JWT_TOKEN>

// El middleware decodifica el token y agrega a req.usuario:
{
  id_usuario: 1,
  nombre: "Juan Pérez",
  email: "juan@ejemplo.com"
}
```

### Rutas Protegidas
Las siguientes rutas requieren autenticación:
- `GET /api/usuarios/mostrar`
- `GET /api/usuarios/validar`
- `PUT /api/usuarios/perfil`

## Seguridad

### Encriptación de Contraseñas
- Utiliza **bcrypt** con salt rounds = 10
- Las contraseñas nunca se almacenan en texto plano
- Las contraseñas no se devuelven en las respuestas

### Sanitización de Datos
- **Nombres**: Solo letras (incluye acentos), espacios
- **Emails**: Solo caracteres válidos para email
- **Validación de formato de email**

### Gestión de Archivos
- **Multer** para manejo de uploads
- Validación de tipos MIME
- Nombres únicos con timestamp
- Carpeta segura: `public/uploads/`

## Estructura de Base de Datos

### Tabla USUARIOS
```sql
CREATE TABLE USUARIOS (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_login TIMESTAMP NULL,
  foto_perfil VARCHAR(500) NULL
);
```

## Ejemplos de Uso

### Flujo de Registro y Login
```javascript
// 1. Registro
const registro = await fetch('/api/usuarios/registro', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    password: 'miPassword123'
  })
});

// 2. Login
const login = await fetch('/api/usuarios/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'juan@ejemplo.com',
    password: 'miPassword123'
  })
});

const { token } = await login.json();

// 3. Usar token en peticiones posteriores
const perfil = await fetch('/api/usuarios/validar', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Actualización de Perfil con Foto
```javascript
const formData = new FormData();
formData.append('nombre', 'Nuevo Nombre');
formData.append('email', 'nuevo@email.com');
formData.append('foto_perfil', archivoImagen);

const response = await fetch('/api/usuarios/perfil', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

---

**Notas:**
- Todos los endpoints de usuarios manejan errores de forma consistente
- Los tokens JWT expiran en 2 horas
- Las fotos se sirven desde `/public/uploads/`
- El email es único en el sistema