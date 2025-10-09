-- ========================================
-- MIGRACIÓN: Soporte para Pagos Parciales
-- ========================================
-- Esta migración agrega la capacidad de realizar pagos parciales
-- en las divisiones de gastos

USE splitease; -- Cambia esto por el nombre de tu base de datos

-- 1. Agregar columna para rastrear el monto pagado
ALTER TABLE DIVISIONES_GASTO 
ADD COLUMN monto_pagado DECIMAL(12,2) NOT NULL DEFAULT 0.00 
AFTER monto_asignado;

-- 2. Agregar columna calculada para saldo pendiente (opcional, mejora rendimiento)
ALTER TABLE DIVISIONES_GASTO 
ADD COLUMN saldo_pendiente DECIMAL(12,2) 
GENERATED ALWAYS AS (monto_asignado - monto_pagado) STORED
AFTER monto_pagado;

-- 3. Actualizar registros existentes
-- Los que están marcados como pagado=1 deben tener monto_pagado = monto_asignado
UPDATE DIVISIONES_GASTO 
SET monto_pagado = monto_asignado 
WHERE pagado = 1;

-- 4. Agregar índice para mejorar consultas de saldos pendientes
CREATE INDEX idx_saldo_pendiente ON DIVISIONES_GASTO(saldo_pendiente);

-- 5. Crear trigger para actualizar automáticamente el campo 'pagado' 
-- cuando el saldo pendiente llegue a 0
DELIMITER $$

DROP TRIGGER IF EXISTS trg_actualizar_estado_pagado$$

CREATE TRIGGER trg_actualizar_estado_pagado
BEFORE UPDATE ON DIVISIONES_GASTO
FOR EACH ROW
BEGIN
  -- Si el monto pagado es mayor o igual al monto asignado, marcar como pagado
  IF NEW.monto_pagado >= NEW.monto_asignado THEN
    SET NEW.pagado = 1;
    SET NEW.fecha_pago = IFNULL(NEW.fecha_pago, CURRENT_TIMESTAMP);
  ELSE
    SET NEW.pagado = 0;
    SET NEW.fecha_pago = NULL;
  END IF;
END$$

DELIMITER ;

-- 6. Mejorar la tabla PAGOS para rastrear pagos parciales
ALTER TABLE PAGOS 
ADD COLUMN tipo_pago ENUM('completo', 'parcial') NOT NULL DEFAULT 'completo' 
AFTER monto;

ALTER TABLE PAGOS 
ADD COLUMN monto_total_deuda DECIMAL(12,2) 
AFTER tipo_pago;

ALTER TABLE PAGOS 
ADD COLUMN saldo_restante DECIMAL(12,2) 
AFTER monto_total_deuda;

-- 7. Comentarios sobre la nueva estructura
-- DIVISIONES_GASTO:
--   monto_asignado: El monto total que debe pagar el usuario
--   monto_pagado: El monto que ya ha pagado (puede ser parcial)
--   saldo_pendiente: monto_asignado - monto_pagado (calculado automáticamente)
--   pagado: 1 si monto_pagado >= monto_asignado, 0 en caso contrario

-- PAGOS:
--   monto: El monto de este pago específico
--   tipo_pago: 'completo' si salda la deuda, 'parcial' si queda saldo pendiente
--   monto_total_deuda: El monto total de la deuda al momento del pago
--   saldo_restante: Cuánto falta por pagar después de este pago

-- NOTAS IMPORTANTES:
-- - Los pagos parciales se registran incrementando 'monto_pagado'
-- - El campo 'pagado' se actualiza automáticamente vía trigger
-- - El campo 'saldo_pendiente' es calculado y siempre refleja el saldo actual
-- - Cada registro en PAGOS indica claramente si fue pago parcial o completo
