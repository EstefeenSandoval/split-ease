# API de Grupos - Split Ease

## Descripción
Esta API gestiona la creación, administración y participación en grupos para el manejo de gastos compartidos. Los grupos tienen códigos de invitación únicos y sistemas de roles (administrador/miembro).

## Base URL
```
/api/grupos
```

## Endpoints Disponibles

### Crear Grupo

#### `POST /api/grupos/crear`
Crea un nuevo grupo y asigna al usuario como administrador.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombre_grupo": "Viaje a Cancún",
  "descripcion": "Gastos del viaje grupal a Cancún 2025"
}
```

**Validaciones:**
- `nombre_grupo`: Requerido, texto limpio
- `descripcion`: Opcional, texto limpio

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Grupo creado correctamente.",
  "grupo": {
    "id_grupo": 5,
    "nombre_grupo": "Viaje a Cancún",
    "descripcion": "Gastos del viaje grupal a Cancún 2025",
    "codigo_invitacion": "abc123def456"
  }
}
```

**Funcionalidades automáticas:**
- Se genera código de invitación único
- El creador se agrega como administrador
- El grupo queda listo para recibir miembros

---

### Obtener Grupos del Usuario

#### `GET /api/grupos/mostrar`
Obtiene todos los grupos donde el usuario es miembro o administrador.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "grupos": [
    {
      "id_grupo": 1,
      "nombre_grupo": "Casa Compartida",
      "descripcion": "Gastos de la casa",
      "fecha_creacion": "2025-09-20T10:00:00Z",
      "codigo_invitacion": "xyz789abc123",
      "id_creador": 1,
      "nombre_creador": "Juan Pérez",
      "rol": "administrador",
      "total_participantes": 4
    }
  ]
}
```

---

### Obtener Grupo por ID

#### `GET /api/grupos/:id`
Obtiene los detalles completos de un grupo específico.

**Headers:**
```
Authorization: Bearer <token>
```

**Parámetros:**
- `id`: ID del grupo (número entero)

**Respuesta exitosa (200):**
```json
{
  "grupo": {
    "id_grupo": 1,
    "nombre_grupo": "Casa Compartida",
    "descripcion": "Gastos mensuales de la casa",
    "fecha_creacion": "2025-09-20T10:00:00Z",
    "codigo_invitacion": "xyz789abc123",
    "id_creador": 1,
    "nombre_creador": "Juan Pérez"
  }
}
```

**Errores posibles:**
- `400`: ID de grupo inválido
- `403`: No tienes acceso a este grupo
- `404`: Grupo no encontrado

---

### Actualizar Grupo

#### `PUT /api/grupos/actualizar/:id`
#### `PUT /api/grupos/:id`
Actualiza la información del grupo. Solo administradores pueden hacerlo.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombre_grupo": "Nuevo nombre del grupo",
  "descripcion": "Nueva descripción del grupo"
}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Grupo actualizado correctamente."
}
```

**Errores posibles:**
- `400`: Datos inválidos
- `403`: Solo administradores pueden actualizar el grupo
- `404`: Grupo no encontrado

---

### Eliminar Grupo

#### `DELETE /api/grupos/eliminar/:id`
#### `DELETE /api/grupos/:id`
Elimina completamente un grupo. Solo el creador puede hacerlo.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Grupo eliminado correctamente."
}
```

**Errores posibles:**
- `400`: ID de grupo inválido
- `403`: Solo el creador puede eliminar el grupo
- `404`: Grupo no encontrado

---

### Obtener Participantes

#### `GET /api/grupos/:id/participantes`
Obtiene la lista de todos los participantes del grupo.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "participantes": [
    {
      "id_usuario": 1,
      "nombre": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "rol": "administrador",
      "fecha_union": "2025-09-20T10:00:00Z",
      "foto_perfil": "http://localhost:3100/public/uploads/foto_perfil-123.jpg"
    },
    {
      "id_usuario": 2,
      "nombre": "María García",
      "email": "maria@ejemplo.com",
      "rol": "miembro",
      "fecha_union": "2025-09-21T14:30:00Z",
      "foto_perfil": null
    }
  ]
}
```

---

### Eliminar Participante

#### `DELETE /api/grupos/:id_grupo/participantes/:id_usuario_eliminar`
Elimina un participante del grupo.

**Headers:**
```
Authorization: Bearer <token>
```

**Parámetros:**
- `id_grupo`: ID del grupo
- `id_usuario_eliminar`: ID del usuario a eliminar

**Permisos:**
- **Administradores**: Pueden eliminar cualquier miembro
- **Miembros**: Solo pueden eliminarse a sí mismos
- **Restricción**: No se puede eliminar al creador del grupo

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Participante eliminado correctamente del grupo."
}
```

**Errores posibles:**
- `400`: IDs inválidos o intento de eliminar al creador
- `403`: Sin permisos para eliminar este participante
- `404`: Usuario no es miembro del grupo

---

### Unirse a Grupo

#### `POST /api/grupos/unirse`
Permite a un usuario unirse a un grupo usando el código de invitación.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "codigo_invitacion": "abc123def456"
}
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Te has unido al grupo correctamente.",
  "grupo": {
    "id_grupo": 5,
    "nombre_grupo": "Viaje a Cancún",
    "descripcion": "Gastos del viaje grupal a Cancún 2025"
  }
}
```

**Errores posibles:**
- `400`: Código de invitación faltante
- `404`: Código inválido o grupo no encontrado
- `409`: Ya eres miembro de este grupo

---

## Sistema de Roles

### Administrador
- **Quién lo obtiene**: Creador del grupo
- **Permisos**:
  - Actualizar información del grupo
  - Eliminar cualquier participante (excepto el creador)
  - Ver todos los gastos y participantes
  - Crear gastos en el grupo

### Miembro
- **Quién lo obtiene**: Usuarios que se unen con código
- **Permisos**:
  - Ver gastos y participantes del grupo
  - Crear gastos en el grupo
  - Abandonar el grupo (eliminarse a sí mismo)
  - Marcar sus propios gastos como pagados

## Códigos de Invitación

### Características
- **Generación**: Automática al crear grupo
- **Formato**: Cadena alfanumérica de 30 caracteres
- **Unicidad**: Cada grupo tiene un código único
- **Permanencia**: El código no expira
- **Uso**: Múltiples usuarios pueden usar el mismo código

### Ejemplo de Código
```
abc123def456ghi789jkl012mno345p
```

## Estructura de Base de Datos

### Tabla GRUPOS
```sql
CREATE TABLE GRUPOS (
  id_grupo INT PRIMARY KEY AUTO_INCREMENT,
  nombre_grupo VARCHAR(100) NOT NULL,
  descripcion TEXT,
  id_creador INT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  codigo_invitacion VARCHAR(50) UNIQUE NOT NULL,
  FOREIGN KEY (id_creador) REFERENCES USUARIOS(id_usuario)
);
```

### Tabla PARTICIPANTES_GRUPO
```sql
CREATE TABLE PARTICIPANTES_GRUPO (
  id_usuario INT,
  id_grupo INT,
  rol ENUM('administrador', 'miembro') DEFAULT 'miembro',
  fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario, id_grupo),
  FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario),
  FOREIGN KEY (id_grupo) REFERENCES GRUPOS(id_grupo)
);
```

## Ejemplos de Uso

### Crear y Compartir Grupo
```javascript
// 1. Crear grupo
const grupo = await fetch('/api/grupos/crear', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre_grupo: 'Departamento Compartido',
    descripcion: 'Gastos mensuales del departamento'
  })
});

const { grupo: nuevoGrupo } = await grupo.json();
console.log('Código para compartir:', nuevoGrupo.codigo_invitacion);
```

### Unirse a Grupo
```javascript
// 2. Otro usuario se une con el código
const union = await fetch('/api/grupos/unirse', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${otroToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    codigo_invitacion: 'abc123def456'
  })
});
```

### Gestionar Participantes
```javascript
// 3. Ver participantes
const participantes = await fetch('/api/grupos/1/participantes', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 4. Eliminar participante (solo administrador)
const eliminacion = await fetch('/api/grupos/1/participantes/5', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${tokenAdmin}` }
});
```

---

**Funcionalidades especiales:**
- Los códigos de invitación son únicos e intransferibles
- Los administradores tienen control total excepto sobre el creador
- Los grupos persisten aunque se eliminen algunos participantes
- Solo el creador puede eliminar completamente el grupo