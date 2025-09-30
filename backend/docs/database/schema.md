# Esquema de Base de Datos - Split Ease

## Descripción General
Split Ease utiliza MySQL como sistema de gestión de base de datos. El esquema está diseñado para manejar usuarios, grupos, gastos compartidos y sus divisiones de manera eficiente y segura.

## Configuración de Base de Datos
- **Motor**: MySQL/MariaDB
- **Codificación**: UTF8MB4 (soporte completo Unicode)
- **Collation**: utf8mb4_unicode_ci
- **Transacciones**: InnoDB para integridad referencial

## Tablas del Sistema

### 1. USUARIOS
Almacena información de los usuarios registrados en la aplicación.

```sql
CREATE TABLE USUARIOS (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  foto_perfil VARCHAR(255),
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_login DATETIME,
  activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;
```

**Campos:**
- `id_usuario`: Clave primaria auto-incremental
- `nombre`: Nombre completo del usuario (max 150 caracteres)
- `email`: Email único del usuario (max 255 caracteres)
- `password_hash`: Contraseña encriptada con bcrypt
- `foto_perfil`: URL de la foto de perfil (opcional)
- `fecha_registro`: Fecha de registro automática
- `ultimo_login`: Fecha del último acceso
- `activo`: Estado del usuario (1=activo, 0=inactivo)

**Índices:**
- PRIMARY KEY: `id_usuario`
- UNIQUE: `email`

---

### 2. CATEGORIAS
Catálogo de categorías para clasificar gastos.

```sql
CREATE TABLE CATEGORIAS (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  descripcion TEXT
) ENGINE=InnoDB;
```

**Campos:**
- `id_categoria`: Clave primaria auto-incremental
- `nombre`: Nombre único de la categoría
- `descripcion`: Descripción opcional de la categoría

**Categorías Predefinidas:**
1. Comida
2. Transporte
3. Entretenimiento
4. Vivienda
5. Compras
6. Salud
7. Educación
8. Viajes
9. Servicios
10. Otros

---

### 3. GRUPOS
Grupos de usuarios para gestionar gastos compartidos.

```sql
CREATE TABLE GRUPOS (
  id_grupo INT AUTO_INCREMENT PRIMARY KEY,
  nombre_grupo VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  descripcion TEXT,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_creador INT NOT NULL,
  codigo_invitacion VARCHAR(50) NOT NULL UNIQUE,
  estado ENUM('activo','inactivo','archivado') NOT NULL DEFAULT 'activo',
  CONSTRAINT fk_grupos_creador FOREIGN KEY (id_creador)
    REFERENCES USUARIOS(id_usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;
```

**Campos:**
- `id_grupo`: Clave primaria auto-incremental
- `nombre_grupo`: Nombre del grupo (max 150 caracteres)
- `descripcion`: Descripción opcional del grupo
- `fecha_creacion`: Fecha de creación automática
- `id_creador`: ID del usuario creador (FK)
- `codigo_invitacion`: Código único para invitar usuarios
- `estado`: Estado del grupo (activo/inactivo/archivado)

**Relaciones:**
- `id_creador` → `USUARIOS.id_usuario`

---

### 4. PARTICIPANTES_GRUPO
Tabla intermedia que relaciona usuarios con grupos y define sus roles.

```sql
CREATE TABLE PARTICIPANTES_GRUPO (
  id_usuario INT NOT NULL,
  id_grupo INT NOT NULL,
  rol ENUM('administrador','miembro') NOT NULL DEFAULT 'miembro',
  fecha_union DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('pendiente','activo','expulsado') NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (id_usuario, id_grupo),
  CONSTRAINT fk_partgrup_usuario FOREIGN KEY (id_usuario)
    REFERENCES USUARIOS(id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_partgrup_grupo FOREIGN KEY (id_grupo)
    REFERENCES GRUPOS(id_grupo)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;
```

**Campos:**
- `id_usuario`: ID del usuario (FK, parte de PK)
- `id_grupo`: ID del grupo (FK, parte de PK)
- `rol`: Rol del usuario (administrador/miembro)
- `fecha_union`: Fecha de ingreso al grupo
- `estado`: Estado de la participación

**Roles:**
- **administrador**: Puede gestionar el grupo y eliminar miembros
- **miembro**: Puede crear gastos y ver información del grupo

---

### 5. GASTOS
Registro de gastos individuales dentro de los grupos.

```sql
CREATE TABLE GASTOS (
  id_gasto INT AUTO_INCREMENT PRIMARY KEY,
  id_grupo INT NOT NULL,
  id_pagador INT NOT NULL,
  descripcion VARCHAR(255),
  monto_total DECIMAL(12,2) NOT NULL,
  id_categoria INT,
  fecha_gasto DATETIME NOT NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('pendiente','confirmado','cancelado') NOT NULL DEFAULT 'pendiente',
  moneda CHAR(3) NOT NULL DEFAULT 'MXN',
  CONSTRAINT fk_gastos_grupo FOREIGN KEY (id_grupo)
    REFERENCES GRUPOS(id_grupo)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_gastos_pagador FOREIGN KEY (id_pagador)
    REFERENCES USUARIOS(id_usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_gastos_categoria FOREIGN KEY (id_categoria)
    REFERENCES CATEGORIAS(id_categoria)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;
```

**Campos:**
- `id_gasto`: Clave primaria auto-incremental
- `id_grupo`: ID del grupo donde se registra el gasto (FK)
- `id_pagador`: ID del usuario que pagó (FK)
- `descripcion`: Descripción del gasto
- `monto_total`: Monto total del gasto (DECIMAL 12,2)
- `id_categoria`: Categoría del gasto (FK, opcional)
- `fecha_gasto`: Fecha real del gasto
- `fecha_registro`: Fecha de registro en el sistema
- `estado`: Estado del gasto (pendiente/confirmado/cancelado)
- `moneda`: Código de moneda ISO (default: MXN)

---

### 6. DIVISIONES_GASTO
División de cada gasto entre los participantes.

```sql
CREATE TABLE DIVISIONES_GASTO (
  id_gasto INT NOT NULL,
  id_usuario INT NOT NULL,
  monto_asignado DECIMAL(12,2) NOT NULL,
  pagado TINYINT(1) NOT NULL DEFAULT 0,
  fecha_pago DATETIME,
  tipo_division ENUM('equitativa','porcentaje','monto_fijo') NOT NULL DEFAULT 'equitativa',
  PRIMARY KEY (id_gasto, id_usuario),
  CONSTRAINT fk_divgasto_gasto FOREIGN KEY (id_gasto)
    REFERENCES GASTOS(id_gasto)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_divgasto_usuario FOREIGN KEY (id_usuario)
    REFERENCES USUARIOS(id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;
```

**Campos:**
- `id_gasto`: ID del gasto (FK, parte de PK)
- `id_usuario`: ID del usuario asignado (FK, parte de PK)
- `monto_asignado`: Cantidad que debe pagar este usuario
- `pagado`: Si ya pagó su parte (0=no, 1=sí)
- `fecha_pago`: Fecha en que marcó como pagado
- `tipo_division`: Tipo de división aplicada

**Tipos de División:**
- **equitativa**: Divide el monto total entre todos los participantes
- **porcentaje**: Cada usuario paga un porcentaje específico
- **monto_fijo**: Cada usuario paga un monto específico

---

### 7. PAGOS
Registro de movimientos de dinero entre usuarios.

```sql
CREATE TABLE PAGOS (
  id_pago INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario_pagador INT NOT NULL,
  id_usuario_receptor INT NOT NULL,
  id_grupo INT NOT NULL,
  id_gasto INT,
  monto DECIMAL(12,2) NOT NULL,
  fecha_pago DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  descripcion VARCHAR(255),
  CONSTRAINT fk_pagos_pagador FOREIGN KEY (id_usuario_pagador)
    REFERENCES USUARIOS(id_usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pagos_receptor FOREIGN KEY (id_usuario_receptor)
    REFERENCES USUARIOS(id_usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pagos_grupo FOREIGN KEY (id_grupo)
    REFERENCES GRUPOS(id_grupo)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_pagos_gasto FOREIGN KEY (id_gasto)
    REFERENCES GASTOS(id_gasto)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;
```

---

### 8. NOTIFICACIONES
Sistema de notificaciones para usuarios.

```sql
CREATE TABLE NOTIFICACIONES (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  tipo_notificacion ENUM('INVITACIÓN','GASTO_AGREGADO','PAGO_REALIZADO','SALDO_CAMBIADO') NOT NULL,
  mensaje TEXT NOT NULL,
  fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  fecha_lectura DATETIME,
  url_destino VARCHAR(255),
  CONSTRAINT fk_notif_usuario FOREIGN KEY (id_usuario)
    REFERENCES USUARIOS(id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;
```

## Diagrama de Relaciones

```
USUARIOS
├── (1:N) GRUPOS (como creador)
├── (N:M) PARTICIPANTES_GRUPO
├── (1:N) GASTOS (como pagador)
├── (1:N) DIVISIONES_GASTO
├── (1:N) PAGOS (como pagador)
├── (1:N) PAGOS (como receptor)
└── (1:N) NOTIFICACIONES

GRUPOS
├── (1:N) GASTOS
├── (N:M) PARTICIPANTES_GRUPO
└── (1:N) PAGOS

GASTOS
├── (1:N) DIVISIONES_GASTO
├── (N:1) CATEGORIAS
└── (1:N) PAGOS (opcional)

CATEGORIAS
└── (1:N) GASTOS
```

## Políticas de Integridad Referencial

### ON DELETE
- **CASCADE**: Elimina registros dependientes automáticamente
- **RESTRICT**: Previene eliminación si existen dependencias
- **SET NULL**: Establece NULL en campos dependientes

### ON UPDATE
- **CASCADE**: Actualiza referencias automáticamente

## Índices y Rendimiento

### Índices Primarios
- Todas las tablas tienen clave primaria auto-incremental
- Las tablas de relación usan claves primarias compuestas

### Índices Únicos
- `USUARIOS.email`
- `CATEGORIAS.nombre`
- `GRUPOS.codigo_invitacion`

### Recomendaciones de Índices Adicionales
```sql
-- Para consultas frecuentes
CREATE INDEX idx_gastos_fecha ON GASTOS(fecha_gasto);
CREATE INDEX idx_gastos_grupo_pagador ON GASTOS(id_grupo, id_pagador);
CREATE INDEX idx_divisiones_pagado ON DIVISIONES_GASTO(pagado);
CREATE INDEX idx_notificaciones_usuario_leida ON NOTIFICACIONES(id_usuario, leida);
```

## Consideraciones de Diseño

### Seguridad
- Contraseñas hasheadas con bcrypt
- Integridad referencial garantizada
- Validación a nivel de aplicación y base de datos

### Escalabilidad
- Uso de DECIMAL para precisión monetaria
- Soporte para múltiples monedas
- Estructura normalizada para evitar redundancia

### Flexibilidad
- Tipos ENUM para estados controlados
- Campos TEXT para descripciones extensas
- Sistema de notificaciones extensible

---

**Archivo de creación**: `database/data.sql`  
**Codificación**: UTF8MB4  
**Motor**: InnoDB  
**Versión mínima MySQL**: 5.7+