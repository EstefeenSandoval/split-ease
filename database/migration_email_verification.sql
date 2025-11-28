-- =====================================================
-- Migración: Sistema de Verificación de Email y Recuperación de Contraseña
-- Fecha: 2024
-- Descripción: Agrega campos necesarios para verificación de email,
--              recuperación de contraseña y control de reenvío
-- =====================================================

-- Agregar campos para verificación de email
ALTER TABLE USUARIOS 
ADD COLUMN email_verificado TINYINT(1) NOT NULL DEFAULT 0 
COMMENT 'Indica si el email ha sido verificado (0=no, 1=sí)';

ALTER TABLE USUARIOS 
ADD COLUMN token_verificacion VARCHAR(255) NULL 
COMMENT 'Token único para verificación de email';

ALTER TABLE USUARIOS 
ADD COLUMN token_verificacion_expira DATETIME NULL 
COMMENT 'Fecha de expiración del token de verificación';

-- Agregar campos para recuperación de contraseña
ALTER TABLE USUARIOS 
ADD COLUMN token_reset_password VARCHAR(255) NULL 
COMMENT 'Token único para recuperación de contraseña';

ALTER TABLE USUARIOS 
ADD COLUMN token_reset_expira DATETIME NULL 
COMMENT 'Fecha de expiración del token de reset (1 hora)';

-- Agregar campo para rate limiting de reenvío de verificación
ALTER TABLE USUARIOS 
ADD COLUMN ultimo_reenvio_verificacion DATETIME NULL 
COMMENT 'Última vez que se reenvió el email de verificación (rate limit 5 min)';

-- Agregar campos para cambio de perfil pendiente
ALTER TABLE USUARIOS 
ADD COLUMN cambio_pendiente_nombre VARCHAR(150) NULL 
COMMENT 'Nuevo nombre pendiente de verificación';

ALTER TABLE USUARIOS 
ADD COLUMN cambio_pendiente_email VARCHAR(255) NULL 
COMMENT 'Nuevo email pendiente de verificación';

ALTER TABLE USUARIOS 
ADD COLUMN token_cambio_perfil VARCHAR(255) NULL 
COMMENT 'Token para confirmar cambios de perfil';

ALTER TABLE USUARIOS 
ADD COLUMN token_cambio_perfil_expira DATETIME NULL 
COMMENT 'Fecha de expiración del token de cambio de perfil';

-- Índices para mejorar rendimiento de búsquedas por token
CREATE INDEX idx_token_verificacion ON USUARIOS(token_verificacion);
CREATE INDEX idx_token_reset_password ON USUARIOS(token_reset_password);
CREATE INDEX idx_token_cambio_perfil ON USUARIOS(token_cambio_perfil);

-- =====================================================
-- NOTAS DE IMPLEMENTACIÓN:
-- =====================================================
-- 1. token_verificacion: Token de 64 caracteres hex, expira en 24 horas
-- 2. token_reset_password: Token de 64 caracteres hex, expira en 1 hora
-- 3. ultimo_reenvio_verificacion: Rate limit de 5 minutos entre reenvíos
-- 4. cambio_pendiente_*: Almacena cambios de perfil hasta que se confirmen
-- =====================================================

-- Marcar usuarios existentes como verificados (opcional - comentar si no se desea)
-- UPDATE USUARIOS SET email_verificado = 1 WHERE email_verificado = 0;
