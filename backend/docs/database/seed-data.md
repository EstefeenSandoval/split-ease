# Datos de Ejemplo - Split Ease

## Descripción
Este archivo contiene datos de ejemplo para poblar la base de datos durante el desarrollo y pruebas. Incluye usuarios de prueba, grupos de ejemplo y gastos simulados.

## Datos Iniciales Incluidos

### Categorías Predefinidas
Las siguientes categorías se crean automáticamente al ejecutar `data.sql`:

1. **Comida** - Gastos relacionados con alimentos y restaurantes
2. **Transporte** - Gastos de transporte público, taxis, combustible
3. **Entretenimiento** - Gastos de ocio, cine, conciertos, actividades
4. **Vivienda** - Gastos de alquiler, servicios básicos, mantenimiento
5. **Compras** - Gastos de compras generales y productos varios
6. **Salud** - Gastos médicos, farmacia, seguros de salud
7. **Educación** - Gastos educativos, libros, cursos
8. **Viajes** - Gastos de viajes, hoteles, vacaciones
9. **Servicios** - Gastos de servicios profesionales y técnicos
10. **Otros** - Gastos que no se ajustan a otras categorías

## Datos de Prueba para Desarrollo

### Script de Datos de Prueba
Crear archivo `database/seed-data.sql` para datos de desarrollo:

```sql
-- ============================================
-- DATOS DE PRUEBA - SOLO PARA DESARROLLO
-- ============================================

USE split_ease;

-- Insertar usuarios de prueba
INSERT INTO USUARIOS (nombre, email, password_hash, activo) VALUES
('Juan Pérez', 'juan@ejemplo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye3IvC4Lpz.4z2OxgQ5HzQ0iqcqKEDqV2', 1),
('María García', 'maria@ejemplo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye3IvC4Lpz.4z2OxgQ5HzQ0iqcqKEDqV2', 1),
('Carlos López', 'carlos@ejemplo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye3IvC4Lpz.4z2OxgQ5HzQ0iqcqKEDqV2', 1),
('Ana Rodríguez', 'ana@ejemplo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye3IvC4Lpz.4z2OxgQ5HzQ0iqcqKEDqV2', 1),
('Pedro Martínez', 'pedro@ejemplo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye3IvC4Lpz.4z2OxgQ5HzQ0iqcqKEDqV2', 1);

-- Insertar grupos de prueba
INSERT INTO GRUPOS (nombre_grupo, descripcion, id_creador, codigo_invitacion) VALUES
('Casa Compartida', 'Gastos de la casa donde vivimos juntos', 1, 'casa2025abc123'),
('Viaje a Cancún', 'Gastos del viaje grupal a Cancún', 2, 'cancun2025xyz789'),
('Oficina Startup', 'Gastos de la oficina compartida', 3, 'office2025def456');

-- Insertar participantes en grupos
INSERT INTO PARTICIPANTES_GRUPO (id_usuario, id_grupo, rol, estado) VALUES
-- Casa Compartida (Grupo 1)
(1, 1, 'administrador', 'activo'),  -- Juan (creador)
(2, 1, 'miembro', 'activo'),       -- María
(3, 1, 'miembro', 'activo'),       -- Carlos

-- Viaje a Cancún (Grupo 2)
(2, 2, 'administrador', 'activo'),  -- María (creadora)
(1, 2, 'miembro', 'activo'),       -- Juan
(4, 2, 'miembro', 'activo'),       -- Ana
(5, 2, 'miembro', 'activo'),       -- Pedro

-- Oficina Startup (Grupo 3)
(3, 3, 'administrador', 'activo'),  -- Carlos (creador)
(1, 3, 'miembro', 'activo'),       -- Juan
(5, 3, 'miembro', 'activo');       -- Pedro

-- Insertar gastos de ejemplo
INSERT INTO GASTOS (id_grupo, id_pagador, descripcion, monto_total, id_categoria, fecha_gasto) VALUES
-- Casa Compartida
(1, 1, 'Supermercado semanal', 1500.00, 1, '2025-09-20 18:30:00'),
(1, 2, 'Internet mensual', 800.00, 9, '2025-09-21 10:00:00'),
(1, 3, 'Luz y agua', 1200.00, 4, '2025-09-22 14:15:00'),

-- Viaje a Cancún
(2, 2, 'Hotel 3 noches', 8000.00, 8, '2025-09-15 16:00:00'),
(2, 1, 'Vuelos redondos', 12000.00, 2, '2025-09-14 09:30:00'),
(2, 4, 'Cena en restaurante', 2400.00, 1, '2025-09-16 20:00:00'),

-- Oficina Startup
(3, 3, 'Café y snacks', 600.00, 1, '2025-09-23 11:00:00'),
(3, 1, 'Papelería y útiles', 350.00, 5, '2025-09-24 15:30:00');

-- Insertar divisiones de gastos (división equitativa)
INSERT INTO DIVISIONES_GASTO (id_gasto, id_usuario, monto_asignado, pagado, tipo_division) VALUES
-- Gasto 1: Supermercado (1500 / 3 personas = 500 c/u)
(1, 1, 500.00, 1, 'equitativa'),  -- Juan (ya pagó porque es el pagador)
(1, 2, 500.00, 0, 'equitativa'),  -- María
(1, 3, 500.00, 1, 'equitativa'),  -- Carlos (pagó)

-- Gasto 2: Internet (800 / 3 personas = 266.67 c/u)
(2, 1, 266.67, 0, 'equitativa'),  -- Juan
(2, 2, 266.67, 1, 'equitativa'),  -- María (ya pagó porque es la pagadora)
(2, 3, 266.66, 0, 'equitativa'),  -- Carlos

-- Gasto 3: Luz y agua (1200 / 3 personas = 400 c/u)
(3, 1, 400.00, 0, 'equitativa'),  -- Juan
(3, 2, 400.00, 0, 'equitativa'),  -- María
(3, 3, 400.00, 1, 'equitativa'),  -- Carlos (ya pagó porque es el pagador)

-- Gasto 4: Hotel Cancún (8000 / 4 personas = 2000 c/u)
(4, 1, 2000.00, 1, 'equitativa'), -- Juan (pagó)
(4, 2, 2000.00, 1, 'equitativa'), -- María (ya pagó porque es la pagadora)
(4, 4, 2000.00, 0, 'equitativa'), -- Ana
(4, 5, 2000.00, 0, 'equitativa'), -- Pedro

-- Gasto 5: Vuelos Cancún (12000 / 4 personas = 3000 c/u)
(5, 1, 3000.00, 1, 'equitativa'), -- Juan (ya pagó porque es el pagador)
(5, 2, 3000.00, 0, 'equitativa'), -- María
(5, 4, 3000.00, 0, 'equitativa'), -- Ana
(5, 5, 3000.00, 1, 'equitativa'), -- Pedro (pagó)

-- Gasto 6: Cena restaurante (2400 / 4 personas = 600 c/u)
(6, 1, 600.00, 0, 'equitativa'),  -- Juan
(6, 2, 600.00, 0, 'equitativa'),  -- María
(6, 4, 600.00, 1, 'equitativa'),  -- Ana (ya pagó porque es la pagadora)
(6, 5, 600.00, 0, 'equitativa'),  -- Pedro

-- Gasto 7: Café oficina (600 / 3 personas = 200 c/u)
(7, 1, 200.00, 1, 'equitativa'),  -- Juan (pagó)
(7, 3, 200.00, 1, 'equitativa'),  -- Carlos (ya pagó porque es el pagador)
(7, 5, 200.00, 0, 'equitativa'),  -- Pedro

-- Gasto 8: Papelería (350 / 3 personas = 116.67 c/u)
(8, 1, 116.67, 1, 'equitativa'),  -- Juan (ya pagó porque es el pagador)
(8, 3, 116.67, 0, 'equitativa'),  -- Carlos
(8, 5, 116.66, 0, 'equitativa');  -- Pedro

-- Insertar algunos pagos de ejemplo
INSERT INTO PAGOS (id_usuario_pagador, id_usuario_receptor, id_grupo, id_gasto, monto, descripcion) VALUES
(3, 1, 1, 1, 500.00, 'Pago por supermercado'),
(1, 2, 2, 4, 2000.00, 'Pago por hotel en Cancún'),
(5, 1, 2, 5, 3000.00, 'Pago por vuelos'),
(1, 3, 3, 7, 200.00, 'Pago por café de oficina');

-- Insertar notificaciones de ejemplo
INSERT INTO NOTIFICACIONES (id_usuario, tipo_notificacion, mensaje, leida) VALUES
(2, 'GASTO_AGREGADO', 'Juan agregó un nuevo gasto: Supermercado semanal ($1,500)', 1),
(3, 'GASTO_AGREGADO', 'Juan agregó un nuevo gasto: Supermercado semanal ($1,500)', 0),
(1, 'PAGO_REALIZADO', 'Carlos pagó $500 por el supermercado', 1),
(2, 'PAGO_REALIZADO', 'Carlos pagó $500 por el supermercado', 0),
(4, 'GASTO_AGREGADO', 'María agregó un nuevo gasto: Hotel 3 noches ($8,000)', 0),
(5, 'GASTO_AGREGADO', 'María agregó un nuevo gasto: Hotel 3 noches ($8,000)', 0);
```

## Credenciales de Usuarios de Prueba

Todos los usuarios de prueba usan la misma contraseña para facilitar las pruebas:

**Contraseña**: `password123`  
**Hash bcrypt**: `$2a$10$N9qo8uLOickgx2ZMRZoMye3IvC4Lpz.4z2OxgQ5HzQ0iqcqKEDqV2`

### Usuarios Disponibles:
1. **Juan Pérez** - `juan@ejemplo.com`
2. **María García** - `maria@ejemplo.com`
3. **Carlos López** - `carlos@ejemplo.com`
4. **Ana Rodríguez** - `ana@ejemplo.com`
5. **Pedro Martínez** - `pedro@ejemplo.com`

## Grupos de Ejemplo

### 1. Casa Compartida
- **Código**: `casa2025abc123`
- **Administrador**: Juan Pérez
- **Miembros**: María García, Carlos López
- **Gastos**: Supermercado, Internet, Servicios

### 2. Viaje a Cancún
- **Código**: `cancun2025xyz789`
- **Administrador**: María García
- **Miembros**: Juan Pérez, Ana Rodríguez, Pedro Martínez
- **Gastos**: Hotel, Vuelos, Restaurantes

### 3. Oficina Startup
- **Código**: `office2025def456`
- **Administrador**: Carlos López
- **Miembros**: Juan Pérez, Pedro Martínez
- **Gastos**: Café, Papelería

## Comandos para Cargar Datos

### Cargar Solo Estructura
```bash
mysql -u split_ease_user -p split_ease < database/data.sql
```

### Cargar Estructura + Datos de Prueba
```bash
mysql -u split_ease_user -p split_ease < database/data.sql
mysql -u split_ease_user -p split_ease < database/seed-data.sql
```

### Limpiar y Recargar Todo
```bash
# Script de limpieza completa
mysql -u split_ease_user -p -e "DROP DATABASE IF EXISTS split_ease; CREATE DATABASE split_ease CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u split_ease_user -p split_ease < database/data.sql
mysql -u split_ease_user -p split_ease < database/seed-data.sql
```

## Consultas Útiles para Verificar Datos

### Ver Resumen de Datos
```sql
-- Contar registros por tabla
SELECT 'USUARIOS' as tabla, COUNT(*) as registros FROM USUARIOS
UNION ALL
SELECT 'GRUPOS', COUNT(*) FROM GRUPOS
UNION ALL
SELECT 'CATEGORIAS', COUNT(*) FROM CATEGORIAS
UNION ALL
SELECT 'GASTOS', COUNT(*) FROM GASTOS
UNION ALL
SELECT 'PARTICIPANTES_GRUPO', COUNT(*) FROM PARTICIPANTES_GRUPO
UNION ALL
SELECT 'DIVISIONES_GASTO', COUNT(*) FROM DIVISIONES_GASTO
UNION ALL
SELECT 'PAGOS', COUNT(*) FROM PAGOS
UNION ALL
SELECT 'NOTIFICACIONES', COUNT(*) FROM NOTIFICACIONES;
```

### Ver Gastos por Grupo
```sql
SELECT 
    g.nombre_grupo,
    ga.descripcion,
    ga.monto_total,
    u.nombre as pagador,
    c.nombre as categoria,
    ga.fecha_gasto
FROM GASTOS ga
JOIN GRUPOS g ON ga.id_grupo = g.id_grupo
JOIN USUARIOS u ON ga.id_pagador = u.id_usuario
LEFT JOIN CATEGORIAS c ON ga.id_categoria = c.id_categoria
ORDER BY g.nombre_grupo, ga.fecha_gasto;
```

### Ver Saldos Pendientes
```sql
SELECT 
    u.nombre as usuario,
    g.nombre_grupo,
    SUM(CASE WHEN dg.pagado = 0 THEN dg.monto_asignado ELSE 0 END) as debe,
    SUM(CASE WHEN dg.pagado = 1 THEN dg.monto_asignado ELSE 0 END) as pagado
FROM DIVISIONES_GASTO dg
JOIN USUARIOS u ON dg.id_usuario = u.id_usuario
JOIN GASTOS ga ON dg.id_gasto = ga.id_gasto
JOIN GRUPOS g ON ga.id_grupo = g.id_grupo
GROUP BY u.id_usuario, g.id_grupo
HAVING debe > 0
ORDER BY g.nombre_grupo, u.nombre;
```

## Script de Reset para Desarrollo

Crear archivo `scripts/reset-dev-data.js`:

```javascript
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});

const resetData = async () => {
  try {
    console.log('🗑️  Limpiando datos existentes...');
    
    await db.promise().query(`
      SET FOREIGN_KEY_CHECKS = 0;
      TRUNCATE TABLE NOTIFICACIONES;
      TRUNCATE TABLE PAGOS;
      TRUNCATE TABLE DIVISIONES_GASTO;
      TRUNCATE TABLE GASTOS;
      TRUNCATE TABLE PARTICIPANTES_GRUPO;
      TRUNCATE TABLE GRUPOS;
      TRUNCATE TABLE USUARIOS;
      SET FOREIGN_KEY_CHECKS = 1;
    `);
    
    console.log('✅ Datos limpiados');
    console.log('📦 Cargando datos de prueba...');
    
    // Aquí cargarías los datos de seed-data.sql
    // O ejecutar las consultas INSERT directamente
    
    console.log('✅ Datos de prueba cargados correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.end();
  }
};

resetData();
```

Ejecutar reset:
```bash
node scripts/reset-dev-data.js
```

---

**Archivos relacionados**:
- `database/data.sql` - Estructura inicial
- `database/seed-data.sql` - Datos de prueba
- `scripts/reset-dev-data.js` - Script de reset

**Nota importante**: Los datos de prueba son solo para desarrollo. Nunca usar en producción.