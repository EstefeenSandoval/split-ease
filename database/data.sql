-- Configuraciones iniciales
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ########### 1. Tabla USUARIOS ###########
DROP TABLE IF EXISTS USUARIOS;
CREATE TABLE USUARIOS (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  email VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  foto_perfil VARCHAR(255),
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_login DATETIME,
  activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB COMMENT='Usuarios de la aplicación';

-- ########### 2. Tabla CATEGORIAS ###########
DROP TABLE IF EXISTS CATEGORIAS;
CREATE TABLE CATEGORIAS (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  descripcion TEXT
) ENGINE=InnoDB COMMENT='Catálogo de categorías de gasto';

-- ########### 3. Tabla GRUPOS ###########
DROP TABLE IF EXISTS GRUPOS;
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
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Grupos de usuarios para gestión de gastos compartidos';

-- ########### 4. Tabla GASTOS ###########
DROP TABLE IF EXISTS GASTOS;
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
) ENGINE=InnoDB COMMENT='Gastos individuales registrados por un pagador dentro de un grupo';

-- ########### 5. Tabla PARTICIPANTES_GRUPO ###########
DROP TABLE IF EXISTS PARTICIPANTES_GRUPO;
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
) ENGINE=InnoDB COMMENT='Tabla intermedia que asocia usuarios con grupos y su rol/estado';

-- ########### 6. Tabla DIVISIONES_GASTO ###########
DROP TABLE IF EXISTS DIVISIONES_GASTO;
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
) ENGINE=InnoDB COMMENT='Tabla que divide cada gasto entre usuarios, con su monto asignado y si ya pagó';

-- ########### 7. Tabla PAGOS ###########
DROP TABLE IF EXISTS PAGOS;
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
) ENGINE=InnoDB
  COMMENT='Movimientos de dinero entre usuarios para saldar deudas o ajustes de balance';

-- ########### 8. Tabla NOTIFICACIONES ###########
DROP TABLE IF EXISTS NOTIFICACIONES;
CREATE TABLE NOTIFICACIONES (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  tipo_notificacion ENUM(
    'INVITACIÓN',
    'GASTO_AGREGADO',
    'PAGO_REALIZADO',
    'SALDO_CAMBIADO'
  ) NOT NULL,
  mensaje TEXT NOT NULL,
  fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  fecha_lectura DATETIME,
  url_destino VARCHAR(255),
  CONSTRAINT fk_notif_usuario FOREIGN KEY (id_usuario)
    REFERENCES USUARIOS(id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Notificaciones que se envían a cada usuario sobre diversos eventos';

-- ########### DATOS INICIALES ###########

-- Insertar categorías por defecto
INSERT INTO CATEGORIAS (nombre, descripcion) VALUES
('Comida', 'Gastos relacionados con alimentos y restaurantes'),
('Transporte', 'Gastos de transporte público, taxis, combustible'),
('Entretenimiento', 'Gastos de ocio, cine, conciertos, actividades'),
('Vivienda', 'Gastos de alquiler, servicios básicos, mantenimiento'),
('Compras', 'Gastos de compras generales y productos varios'),
('Salud', 'Gastos médicos, farmacia, seguros de salud'),
('Educación', 'Gastos educativos, libros, cursos'),
('Viajes', 'Gastos de viajes, hoteles, vacaciones'),
('Servicios', 'Gastos de servicios profesionales y técnicos'),
('Otros', 'Gastos que no se ajustan a otras categorías');

-- Restaurar revisión de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;
