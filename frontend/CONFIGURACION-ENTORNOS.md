# 🎯 Configuración de Entornos - Split Ease

## ✅ Configuración Completada

Tu aplicación ahora cambia **automáticamente** entre desarrollo y producción.

## 📁 Archivos Creados

```
frontend/
├── .env.development        ← Desarrollo (localhost:3100)
├── .env.production         ← Producción (Railway)
├── .env.example            ← Template para referencia
└── src/config/
    ├── api.js              ← Configuración dinámica ✨
    ├── api.dev.js          ← Respaldo del antiguo sistema
    └── api.prod.js         ← Respaldo del antiguo sistema
```

## 🚀 Comandos

### Desarrollo Local
```bash
npm start
```
✅ Usa automáticamente: `http://localhost:3100`

### Build para Producción
```bash
npm run build
```
✅ Usa automáticamente: `https://backend-split-ease.up.railway.app`

## 🔄 Prioridad de Configuración

1. `.env.local` (si existe) - más prioridad
2. `.env.development` o `.env.production` (según comando)
3. Fallback en `api.js` (por defecto)

## 🎨 Ventajas del Nuevo Sistema

✅ **Automático** - No más copiar archivos manualmente
✅ **Seguro** - `.env.local` no se sube a Git
✅ **Flexible** - Fácil agregar más entornos (staging, testing)
✅ **Estándar** - Práctica común en la industria
✅ **Limpio** - Un solo archivo `api.js` que se adapta

## 🔧 Personalización Local

Si necesitas probar con otra URL temporalmente:

```bash
# Crear archivo .env.local
echo "REACT_APP_API_URL=https://mi-servidor-test.com" > .env.local

# Reiniciar servidor
npm start
```

## 📝 Notas Importantes

- Los archivos `.env.local`, `.env.*.local` NO se suben a Git
- Los archivos `.env.development` y `.env.production` SÍ se suben a Git
- Debes reiniciar el servidor después de cambiar archivos `.env`
- Las variables DEBEN empezar con `REACT_APP_` para ser accesibles

## 🆘 Troubleshooting

**Problema**: La URL no cambia
**Solución**: Reinicia el servidor (`Ctrl+C` y `npm start`)

**Problema**: Quiero usar otra URL temporalmente
**Solución**: Crea `.env.local` con tu URL personalizada

**Problema**: ¿Cómo veo qué URL está usando?
**Solución**: Agrega en cualquier componente:
```javascript
console.log('API URL:', process.env.REACT_APP_API_URL);
```
