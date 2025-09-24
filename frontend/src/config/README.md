# Configuración de APIs para Deployment

## Archivos de Configuración

### `api.js` (Desarrollo)
- Configurado para usar `localhost:3100`
- Usado durante el desarrollo local

### `api.prod.js.example` (Producción - Ejemplo)
- Archivo de ejemplo para configuración de producción
- Renombrar a `api.js` cuando se despliegue en producción

## Cómo hacer el deployment

### Paso 1: Preparar la configuración de producción
1. Hacer una copia del archivo actual `api.js` como respaldo:
   ```bash
   cp src/config/api.js src/config/api.dev.js
   ```

2. Copiar el archivo de ejemplo:
   ```bash
   cp src/config/api.prod.js.example src/config/api.prod.js
   ```

3. Editar `src/config/api.prod.js` y cambiar:
   ```javascript
   const BASE_URL = 'https://tu-dominio.com'; // Cambiar por tu URL de producción
   ```

### Paso 2: Reemplazar configuración para producción
```bash
# Respaldar archivo de desarrollo
mv src/config/api.js src/config/api.dev.backup.js

# Usar configuración de producción
cp src/config/api.prod.js src/config/api.js
```

### Paso 3: Construir para producción
```bash
npm run build
```

### Paso 4: Para volver al desarrollo
```bash
# Restaurar configuración de desarrollo
mv src/config/api.dev.backup.js src/config/api.js
```

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