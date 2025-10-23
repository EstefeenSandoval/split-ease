-- =====================================================
-- Script de creación de tabla NOTIFICACIONES
-- Módulo de notificaciones para Splitease
-- =====================================================

-- Eliminar tabla si existe (usar con precaución en producción)
-- DROP TABLE IF EXISTS NOTIFICACIONES;

-- Crear tabla NOTIFICACIONES
CREATE TABLE IF NOT EXISTS NOTIFICACIONES (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  tipo_notificacion ENUM('INVITACIÓN', 'GASTO_AGREGADO', 'PAGO_REALIZADO', 'SALDO_CAMBIADO') NOT NULL,
  mensaje TEXT NOT NULL,
  fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  fecha_lectura DATETIME DEFAULT NULL,
  url_destino VARCHAR(255) DEFAULT NULL,
  
  -- Índices para mejorar el rendimiento
  INDEX idx_usuario_leida (id_usuario, leida),
  INDEX idx_fecha_envio (fecha_envio),
  INDEX idx_usuario_fecha (id_usuario, fecha_envio),
  
  -- Llave foránea
  CONSTRAINT fk_notif_usuario 
    FOREIGN KEY (id_usuario) 
    REFERENCES USUARIOS(id_usuario)
    ON UPDATE CASCADE 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Datos de prueba (opcional - comentar en producción)
-- =====================================================

-- Insertar notificaciones de prueba para el usuario con id 1
-- Descomenta las siguientes líneas para agregar datos de prueba

/*
INSERT INTO NOTIFICACIONES (id_usuario, tipo_notificacion, mensaje, url_destino) VALUES
(1, 'INVITACIÓN', 'Te han invitado al grupo "Vacaciones 2025"', '/grupos/1'),
(1, 'GASTO_AGREGADO', 'Se agregó un nuevo gasto de $150.00 en "Cena de amigos"', '/grupos/2/gastos'),
(1, 'PAGO_REALIZADO', 'María realizó un pago de $50.00 en el grupo "Oficina"', '/grupos/3'),
(1, 'SALDO_CAMBIADO', 'Tu saldo en "Viaje a la playa" cambió a -$75.00', '/grupos/4'),
(1, 'GASTO_AGREGADO', 'Se agregó el gasto "Hotel" por $300.00', '/grupos/1/gastos');

-- Insertar una notificación ya leída
INSERT INTO NOTIFICACIONES (id_usuario, tipo_notificacion, mensaje, leida, fecha_lectura, url_destino) VALUES
(1, 'PAGO_REALIZADO', 'Juan realizó un pago de $100.00', 1, NOW(), '/grupos/5');
*/

-- =====================================================
-- Consultas útiles para verificación
-- =====================================================

-- Ver todas las notificaciones
-- SELECT * FROM NOTIFICACIONES;

-- Ver notificaciones de un usuario específico
-- SELECT * FROM NOTIFICACIONES WHERE id_usuario = 1 ORDER BY fecha_envio DESC;

-- Ver notificaciones no leídas
-- SELECT * FROM NOTIFICACIONES WHERE id_usuario = 1 AND leida = 0 ORDER BY fecha_envio DESC;

-- Contar notificaciones no leídas por usuario
-- SELECT id_usuario, COUNT(*) as total_no_leidas 
-- FROM NOTIFICACIONES 
-- WHERE leida = 0 
-- GROUP BY id_usuario;

-- Ver estadísticas de notificaciones por tipo
-- SELECT tipo_notificacion, COUNT(*) as total, 
--        SUM(CASE WHEN leida = 1 THEN 1 ELSE 0 END) as leidas,
--        SUM(CASE WHEN leida = 0 THEN 1 ELSE 0 END) as no_leidas
-- FROM NOTIFICACIONES
-- GROUP BY tipo_notificacion;

-- =====================================================
-- Procedimientos almacenados útiles (opcional)
-- =====================================================

-- Procedimiento para limpiar notificaciones antiguas (más de 30 días y leídas)
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS limpiar_notificaciones_antiguas()
BEGIN
  DELETE FROM NOTIFICACIONES 
  WHERE leida = 1 
  AND fecha_lectura < DATE_SUB(NOW(), INTERVAL 30 DAY);
  
  SELECT ROW_COUNT() as notificaciones_eliminadas;
END//

DELIMITER ;

-- Uso: CALL limpiar_notificaciones_antiguas();

-- =====================================================
-- Triggers útiles (opcional)
-- =====================================================

-- Trigger para actualizar automáticamente fecha_lectura al marcar como leída
DELIMITER //

CREATE TRIGGER IF NOT EXISTS trg_notificacion_leida 
BEFORE UPDATE ON NOTIFICACIONES
FOR EACH ROW
BEGIN
  IF NEW.leida = 1 AND OLD.leida = 0 AND NEW.fecha_lectura IS NULL THEN
    SET NEW.fecha_lectura = NOW();
  END IF;
END//

DELIMITER ;

-- =====================================================
-- Verificación de la creación
-- =====================================================

-- Verificar que la tabla se creó correctamente
SELECT 
  TABLE_NAME, 
  ENGINE, 
  TABLE_ROWS, 
  CREATE_TIME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'NOTIFICACIONES';

-- Verificar los índices creados
SHOW INDEX FROM NOTIFICACIONES;

-- Verificar las llaves foráneas
SELECT 
  CONSTRAINT_NAME,
  CONSTRAINT_TYPE,
  TABLE_NAME
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'NOTIFICACIONES';

-- =====================================================
-- Script completado exitosamente
-- =====================================================
