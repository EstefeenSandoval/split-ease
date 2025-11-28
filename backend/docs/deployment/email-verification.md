# Configuración de Verificación de Email con Mailjet

Esta guía explica cómo configurar el sistema de verificación de email y recuperación de contraseña en SplitEase usando Mailjet como proveedor SMTP.

## Requisitos Previos

1. Una cuenta en [Mailjet](https://www.mailjet.com/) (el plan gratuito permite 6,000 emails/mes)
2. Acceso al dashboard de Railway para configurar variables de entorno

## Configuración en Mailjet

### 1. Crear cuenta en Mailjet

1. Ve a [https://www.mailjet.com/](https://www.mailjet.com/)
2. Haz clic en "Get Started Free"
3. Completa el registro con tu email y datos

### 2. Obtener credenciales API

1. Inicia sesión en Mailjet
2. Ve a **Account Settings** → **API Keys** (o directamente a [https://app.mailjet.com/account/apikeys](https://app.mailjet.com/account/apikeys))
3. Encontrarás dos claves:
   - **API Key** (pública)
   - **Secret Key** (privada)

### 3. Verificar dominio de envío (Recomendado)

Para mejor entregabilidad:
1. Ve a **Sender Domains & Addresses**
2. Agrega y verifica el dominio desde el que enviarás emails
3. Sigue las instrucciones para agregar registros DNS (SPF y DKIM)

## Configuración en Railway

### Variables de Entorno Requeridas

Agrega las siguientes variables de entorno en tu proyecto de Railway:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MJ_APIKEY_PUBLIC` | API Key pública de Mailjet | `abc123def456...` |
| `MJ_APIKEY_PRIVATE` | Secret Key de Mailjet | `xyz789abc012...` |
| `MJ_SENDER_EMAIL` | Email del remitente | `noreply@split-ease.up.railway.app` |
| `MJ_SENDER_NAME` | Nombre del remitente | `SplitEase` |
| `FRONTEND_URL` | URL del frontend | `https://split-ease.up.railway.app` |

### Pasos para configurar en Railway

1. Ve a tu proyecto en [Railway](https://railway.app/dashboard)
2. Selecciona el servicio del backend
3. Ve a la pestaña **Variables**
4. Agrega cada variable usando **+ New Variable**
5. Railway automáticamente reiniciará el servicio

### Ejemplo de configuración:

```
MJ_APIKEY_PUBLIC=tu_api_key_publica
MJ_APIKEY_PRIVATE=tu_secret_key
MJ_SENDER_EMAIL=noreply@split-ease.up.railway.app
MJ_SENDER_NAME=SplitEase
FRONTEND_URL=https://split-ease.up.railway.app
```

## Migración de Base de Datos

Ejecuta la migración para agregar las columnas necesarias:

```sql
-- Ejecutar en tu base de datos MySQL
SOURCE database/migration_email_verification.sql
```

O ejecuta directamente:

```sql
ALTER TABLE USUARIOS
ADD COLUMN email_verificado BOOLEAN DEFAULT FALSE,
ADD COLUMN token_verificacion VARCHAR(255) DEFAULT NULL,
ADD COLUMN token_verificacion_expira DATETIME DEFAULT NULL,
ADD COLUMN token_reset_password VARCHAR(255) DEFAULT NULL,
ADD COLUMN token_reset_expira DATETIME DEFAULT NULL,
ADD COLUMN ultimo_reenvio_verificacion DATETIME DEFAULT NULL,
ADD COLUMN cambio_pendiente_nombre VARCHAR(255) DEFAULT NULL,
ADD COLUMN cambio_pendiente_email VARCHAR(255) DEFAULT NULL,
ADD COLUMN token_cambio_perfil VARCHAR(255) DEFAULT NULL,
ADD COLUMN token_cambio_perfil_expira DATETIME DEFAULT NULL;
```

## Instalación de Dependencia

Si aún no has instalado la dependencia de Mailjet:

```bash
cd backend
npm install node-mailjet@6.0.5
```

## Flujo de Verificación

### Registro de Usuario
1. Usuario se registra con email
2. Se crea la cuenta con `email_verificado = false`
3. Se envía email con enlace de verificación (expira en 24h)
4. Usuario hace clic en el enlace
5. Se actualiza `email_verificado = true`

### Recuperación de Contraseña
1. Usuario solicita recuperación desde `/forgot-password`
2. Se envía email con enlace de reset (expira en 1h)
3. Usuario hace clic y establece nueva contraseña
4. Se actualiza la contraseña y se invalida el token

### Cambio de Nombre/Email en Perfil
1. Usuario intenta cambiar nombre o email
2. Se envía email de verificación del cambio
3. Usuario confirma haciendo clic en el enlace
4. Se aplican los cambios al perfil

## Endpoints de la API

### Verificación de Email
- `GET /api/usuarios/verificar-email/:token` - Verificar email con token
- `POST /api/usuarios/reenviar-verificacion` - Reenviar email de verificación (límite: 1 cada 5 min)

### Recuperación de Contraseña
- `POST /api/usuarios/forgot-password` - Solicitar reset de contraseña
- `GET /api/usuarios/reset-password/:token` - Validar token de reset
- `POST /api/usuarios/reset-password/:token` - Establecer nueva contraseña

### Cambio de Perfil
- `GET /api/usuarios/verificar-cambio/:token` - Confirmar cambio de nombre/email

## Restricciones

- **Rate limiting en reenvío**: Solo se puede reenviar el email de verificación cada 5 minutos
- **Expiración de tokens**:
  - Verificación de email: 24 horas
  - Reset de contraseña: 1 hora
  - Cambio de perfil: 1 hora
- **Bloqueo de funciones**:
  - Si el email no está verificado, no se puede editar nombre/email en el perfil
  - La recuperación de contraseña solo funciona para emails verificados

## Solución de Problemas

### Los emails no llegan
1. Verifica las credenciales de Mailjet
2. Revisa la carpeta de spam
3. Verifica que el email del remitente esté configurado correctamente
4. En Mailjet, revisa el log de emails enviados

### Token expirado
- Solicita un nuevo email de verificación desde el banner en la app

### Email ya registrado
- El sistema previene duplicados de email

## Limitaciones del Plan Gratuito de Mailjet

- 6,000 emails por mes
- 200 emails por día
- Sin soporte prioritario
- Marca de agua de Mailjet en emails

Para producción con alto volumen, considera un plan de pago.
