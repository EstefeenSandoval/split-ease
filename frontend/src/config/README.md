# Configuración de APIs con Variables de Entorno

## 🚀 Cambio Automático entre Desarrollo y Producción

La aplicación ahora **cambia automáticamente** la URL del backend según el entorno:

- **`npm start`** → Usa `http://localhost:3100` (desarrollo)
- **`npm run build`** → Usa `https://backend-split-ease.up.railway.app` (producción)

## Archivos de Configuración

### `api.js`
- Archivo principal que detecta automáticamente el entorno
- Lee las variables de entorno y configura la URL correcta
- **No necesitas modificarlo manualmente**

### Variables de Entorno (`.env` files)

#### `.env.development`
- Se usa automáticamente con `npm start`
- Configurado para desarrollo local: `http://localhost:3100`

#### `.env.production`
- Se usa automáticamente con `npm run build`
- Configurado para Railway: `https://backend-split-ease.up.railway.app`

#### `.env.local` (opcional)
- Para sobrescribir configuraciones localmente
- **NO se sube a Git** (está en .gitignore)
- Útil si necesitas probar con una URL diferente

## 📝 Cómo Usar

### Desarrollo Local
```bash
npm start
# Automáticamente usa localhost:3100
```

### Build para Producción
```bash
npm run build
# Automáticamente usa Railway URL
```

### Cambiar URL Temporalmente
Si necesitas usar una URL diferente temporalmente, crea un archivo `.env.local`:
```bash
REACT_APP_API_URL=https://otra-url.com
```

## 🔧 Cómo Funciona

1. React Scripts detecta el entorno (`development` o `production`)
2. Carga el archivo `.env` correspondiente
3. `api.js` lee `process.env.REACT_APP_API_URL`
4. Si no existe, usa el valor por defecto según `NODE_ENV`

## Funciones disponibles

### `API_ENDPOINTS`
Contiene todas las URLs de los endpoints de la API:
- `usuarios.*`: Endpoints relacionados con usuarios
- `grupos.*`: Endpoints relacionados con grupos

### `STATIC_BASE_URL`
URL base para archivos estáticos (imágenes, uploads).

### `construirURLEstatico(ruta)`
Función auxiliar que:
- Maneja data URLs (para previews)
- Detecta URLs absolutas
- Construye URLs completas para rutas relativas

## Ejemplo de uso

```javascript
import { API_ENDPOINTS, construirURLEstatico } from '../config/api';

// Para hacer fetch a API
const response = await fetch(API_ENDPOINTS.usuarios.perfil);

// Para URLs de imágenes
const imagenURL = construirURLEstatico(usuario.foto_perfil);
```

## Ventajas de esta configuración

1. **Centralizada**: Todas las URLs en un solo lugar
2. **Fácil deployment**: Solo cambiar una línea para producción
3. **Mantenible**: No hay URLs hardcodeadas en componentes
4. **Flexible**: Fácil cambio entre desarrollo y producción
5. **Consistente**: Misma lógica para todas las URLs estáticas