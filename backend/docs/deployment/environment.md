# Variables de Entorno - Split Ease Backend

## Descripción
Este documento describe todas las variables de entorno necesarias para configurar el backend de Split Ease en diferentes ambientes.

## Archivo .env

### Plantilla Básica
Crear archivo `.env` en la raíz del directorio `backend/`:

```env
# ============================================
# CONFIGURACIÓN DE BASE DE DATOS
# ============================================
DB_HOST=localhost
DB_USER=split_ease_user
DB_PASSWORD=tu_password_seguro
DB_NAME=split_ease

# ============================================
# CONFIGURACIÓN DE AUTENTICACIÓN JWT
# ============================================
JWT_SECRET=tu_clave_secreta_jwt_muy_larga_y_segura

# ============================================
# CONFIGURACIÓN DEL SERVIDOR
# ============================================
PORT=3100
NODE_ENV=development

# ============================================
# CONFIGURACIÓN CORS Y FRONTEND
# ============================================
FRONTEND_URL=http://localhost:3000
```

## Variables Detalladas

### Base de Datos

#### `DB_HOST`
- **Descripción**: Dirección del servidor MySQL
- **Tipo**: String
- **Requerido**: Sí
- **Ejemplos**:
  - `localhost` - Desarrollo local
  - `127.0.0.1` - IP local
  - `mysql.ejemplo.com` - Servidor remoto
  - `192.168.1.100` - IP en red local

```env
DB_HOST=localhost
```

#### `DB_USER`
- **Descripción**: Usuario de MySQL para conectarse
- **Tipo**: String
- **Requerido**: Sí
- **Recomendaciones**: 
  - No usar `root` en producción
  - Crear usuario específico para la aplicación

```env
DB_USER=split_ease_user
```

#### `DB_PASSWORD`
- **Descripción**: Contraseña del usuario de MySQL
- **Tipo**: String
- **Requerido**: Sí
- **Seguridad**: 
  - Mínimo 12 caracteres
  - Combinar letras, números y símbolos

```env
DB_PASSWORD=MiPassword123!Seguro
```

#### `DB_NAME`
- **Descripción**: Nombre de la base de datos
- **Tipo**: String
- **Requerido**: Sí
- **Convención**: Usar nombres descriptivos

```env
DB_NAME=split_ease
```

### Autenticación JWT

#### `JWT_SECRET`
- **Descripción**: Clave secreta para firmar tokens JWT
- **Tipo**: String
- **Requerido**: Sí
- **Seguridad**: 
  - Mínimo 32 caracteres
  - Usar caracteres aleatorios
  - **CRÍTICO**: Debe ser única y secreta

```env
JWT_SECRET=4f8b2c3d9e1a6b5c8f2e7d4a9b6c3f8e2d5a8b1c4f7e0d3a6b9c2f5e8a1d4b7c0
```

**Generar JWT_SECRET seguro:**
```bash
# Método 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Método 2: OpenSSL
openssl rand -hex 64

# Método 3: Online (NO recomendado para producción)
# Usar generadores online solo para desarrollo
```

### Configuración del Servidor

#### `PORT`
- **Descripción**: Puerto donde el servidor escuchará
- **Tipo**: Number
- **Requerido**: No (default: 3100)
- **Rango**: 1024-65535 (recomendado)

```env
PORT=3100
```

#### `NODE_ENV`
- **Descripción**: Ambiente de ejecución
- **Tipo**: String
- **Requerido**: No (default: development)
- **Valores válidos**:
  - `development` - Desarrollo
  - `production` - Producción
  - `test` - Pruebas

```env
NODE_ENV=production
```

### CORS y Frontend

#### `FRONTEND_URL`
- **Descripción**: URL del frontend para configurar CORS
- **Tipo**: String
- **Requerido**: No (default: http://localhost:3000)
- **Formato**: URL completa con protocolo

```env
FRONTEND_URL=https://mi-app.com
```

## Configuraciones por Ambiente

### Desarrollo Local
```env
# .env para desarrollo
NODE_ENV=development
PORT=3100
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password123
DB_NAME=split_ease_dev
JWT_SECRET=desarrollo_jwt_secret_no_usar_en_produccion
FRONTEND_URL=http://localhost:3000
```

### Pruebas (Testing)
```env
# .env.test
NODE_ENV=test
PORT=3101
DB_HOST=localhost
DB_USER=test_user
DB_PASSWORD=test_password
DB_NAME=split_ease_test
JWT_SECRET=test_jwt_secret_temporal
FRONTEND_URL=http://localhost:3001
```

### Producción
```env
# .env.production
NODE_ENV=production
PORT=3100
DB_HOST=prod-mysql.servidor.com
DB_USER=split_ease_prod
DB_PASSWORD=SuperSecurePassword123!@#
DB_NAME=split_ease_production
JWT_SECRET=clave_jwt_super_secreta_de_64_caracteres_minimo_para_prod_2025
FRONTEND_URL=https://splitease.com
```

## Validación de Variables

### Script de Validación
Crear archivo `scripts/validate-env.js`:

```javascript
require('dotenv').config();

const requiredVars = [
  'DB_HOST',
  'DB_USER', 
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET'
];

const optionalVars = [
  'PORT',
  'NODE_ENV',
  'FRONTEND_URL'
];

console.log('🔍 Validando variables de entorno...\n');

// Verificar variables requeridas
let missing = [];
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missing.push(varName);
  } else {
    console.log(`✅ ${varName}: ***`);
  }
});

// Verificar variables opcionales
optionalVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: ${process.env[varName]}`);
  } else {
    console.log(`⚠️  ${varName}: usando valor por defecto`);
  }
});

// Validaciones específicas
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.log('❌ JWT_SECRET debe tener al menos 32 caracteres');
  missing.push('JWT_SECRET (muy corto)');
}

if (process.env.PORT && (isNaN(process.env.PORT) || process.env.PORT < 1024)) {
  console.log('❌ PORT debe ser un número mayor a 1024');
}

// Resultado
if (missing.length > 0) {
  console.log('\n❌ Faltan variables requeridas:');
  missing.forEach(varName => console.log(`   - ${varName}`));
  process.exit(1);
} else {
  console.log('\n✅ Todas las variables están configuradas correctamente');
}
```

Ejecutar validación:
```bash
node scripts/validate-env.js
```

## Seguridad de Variables

### ⚠️ Nunca Hacer
- Subir archivo `.env` a repositorios Git
- Usar valores por defecto en producción
- Compartir `JWT_SECRET` en texto plano
- Usar contraseñas simples en producción

### ✅ Buenas Prácticas
- Usar archivo `.env.example` como plantilla
- Rotar `JWT_SECRET` periódicamente en producción
- Usar gestores de secretos en cloud (AWS Secrets Manager, etc.)
- Configurar variables específicas por ambiente

### Archivo .env.example
```env
# Plantilla de variables de entorno
# Copiar a .env y configurar valores reales

# Base de datos
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=split_ease

# JWT (generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=tu_clave_jwt_secreta_aqui

# Servidor
PORT=3100
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000
```

### .gitignore
Asegurar que `.env` esté en `.gitignore`:
```gitignore
# Variables de entorno
.env
.env.local
.env.production
.env.test

# Logs
*.log
npm-debug.log*

# Dependencias
node_modules/

# Uploads
public/uploads/*
!public/uploads/.gitkeep
```

## Herramientas de Gestión

### dotenv-safe
Para validación automática de variables:
```bash
npm install dotenv-safe
```

```javascript
// En lugar de require('dotenv').config()
require('dotenv-safe').config({
  example: '.env.example'
});
```

### cross-env
Para establecer variables en diferentes SO:
```bash
npm install cross-env --save-dev
```

```json
{
  "scripts": {
    "start": "cross-env NODE_ENV=production node index.js",
    "dev": "cross-env NODE_ENV=development nodemon index.js"
  }
}
```

---

**Archivos de configuración**:
- `.env` - Variables de entorno
- `.env.example` - Plantilla de ejemplo
- `scripts/validate-env.js` - Script de validación

**Prioridad de variables**:
1. Variables de sistema del SO
2. Variables del archivo `.env`
3. Valores por defecto en el código