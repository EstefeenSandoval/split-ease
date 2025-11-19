# Configuración de Capacitor para Splitease

## 📱 Aplicación Móvil con Capacitor

Esta guía te ayudará a ejecutar Splitease como aplicación móvil nativa en Android e iOS usando Capacitor.

## 🚀 Requisitos Previos

### Para Android:
- **Android Studio** (última versión)
- **Java JDK 11 o superior**
- **Android SDK** (se instala con Android Studio)
- Un dispositivo Android físico o emulador configurado

### Para iOS (Solo en macOS):
- **Xcode** (última versión)
- **CocoaPods** instalado (`sudo gem install cocoapods`)
- Un dispositivo iOS físico o simulador

## 📦 Instalación Completada

Ya se han instalado las siguientes dependencias:
```bash
@capacitor/core
@capacitor/cli
@capacitor/android
@capacitor/ios
```

Y se han agregado las plataformas:
- ✅ Android
- ✅ iOS

## 🛠️ Scripts Disponibles

### Sincronizar cambios (después de modificar código):
```bash
npm run cap:sync
```
Este comando construye tu app React y copia los archivos a las plataformas nativas.

### Abrir en Android Studio:
```bash
npm run cap:open:android
```

### Abrir en Xcode:
```bash
npm run cap:open:ios
```

### Ejecutar en Android:
```bash
npm run cap:run:android
```

### Ejecutar en iOS:
```bash
npm run cap:run:ios
```

### Copiar assets sin rebuild:
```bash
npm run cap:copy
```

## 🔧 Desarrollo

### 1. Desarrollo en navegador
Desarrolla normalmente tu app React:
```bash
npm start
```

### 2. Probar en dispositivo móvil

#### Opción A: Usando la IP de tu PC (Recomendado para desarrollo)

1. **Encuentra tu IP local:**
   - Windows: `ipconfig` (busca IPv4 Address)
   - macOS/Linux: `ifconfig` o `ip addr`

2. **Edita `capacitor.config.ts`:**
   ```typescript
   server: {
     url: 'http://TU_IP_LOCAL:3000',
     cleartext: true
   }
   ```

3. **Inicia el servidor de desarrollo:**
   ```bash
   npm start
   ```

4. **Sincroniza y ejecuta:**
   ```bash
   npm run cap:sync
   npm run cap:open:android  # o ios
   ```

5. **Ejecuta desde Android Studio o Xcode**

**Nota:** Tu dispositivo móvil y PC deben estar en la misma red WiFi.

#### Opción B: Build de producción

1. **Construye la aplicación:**
   ```bash
   npm run build
   ```

2. **Sincroniza con las plataformas nativas:**
   ```bash
   npx cap sync
   ```

3. **Abre en el IDE nativo:**
   ```bash
   npm run cap:open:android  # Para Android
   # o
   npm run cap:open:ios      # Para iOS
   ```

4. **Ejecuta desde Android Studio o Xcode**

## 📱 Ejecutar en Android

### Desde Android Studio:
1. Ejecuta `npm run cap:open:android`
2. Espera a que Gradle sincronice
3. Conecta tu dispositivo Android o inicia un emulador
4. Click en el botón "Run" (▶️)

### Desde línea de comandos:
```bash
npm run cap:run:android
```

### Problemas comunes en Android:
- **Gradle sync failed**: Asegúrate de tener instalado JDK 11 o superior
- **SDK not found**: Configura ANDROID_HOME en tus variables de entorno
- **Build failed**: Limpia el proyecto en Android Studio (Build > Clean Project)

## 🍎 Ejecutar en iOS (Solo macOS)

### Desde Xcode:
1. Ejecuta `npm run cap:open:ios`
2. Espera a que CocoaPods instale dependencias
3. Selecciona un simulador o dispositivo físico
4. Click en el botón "Run" (▶️)

### Problemas comunes en iOS:
- **CocoaPods not installed**: Ejecuta `sudo gem install cocoapods`
- **Pod install failed**: Ejecuta `cd ios/App && pod install`
- **Signing error**: Configura tu cuenta de Apple Developer en Xcode

## 🔄 Workflow Típico de Desarrollo

1. **Desarrolla en el navegador:**
   ```bash
   npm start
   ```

2. **Cuando quieras probar en móvil:**
   ```bash
   npm run cap:sync
   npm run cap:open:android  # o ios
   ```

3. **Realiza cambios en el código**

4. **Sincroniza nuevamente:**
   ```bash
   npm run cap:sync
   ```

## 🌐 Configuración de API

### Para desarrollo local:
El archivo `src/config/api.js` ya está configurado para detectar automáticamente el entorno. Asegúrate de:

1. **En desarrollo móvil**, usa la IP de tu PC en lugar de localhost
2. **En producción**, el backend apunta a: `https://backend-split-ease.up.railway.app`

### Variables de entorno:
Puedes crear un archivo `.env` en la raíz de `frontend`:
```env
REACT_APP_API_URL=http://TU_IP_LOCAL:3100
```

## 📝 Plugins Adicionales Útiles

Si necesitas funcionalidades nativas adicionales, puedes instalar plugins de Capacitor:

```bash
# Cámara
npm install @capacitor/camera

# Notificaciones Push
npm install @capacitor/push-notifications

# Compartir
npm install @capacitor/share

# Geolocalización
npm install @capacitor/geolocation

# Almacenamiento
npm install @capacitor/preferences
```

Después de instalar plugins:
```bash
npm run cap:sync
```

## 🔐 Permisos

Los permisos se configuran en:
- **Android**: `android/app/src/main/AndroidManifest.xml`
- **iOS**: `ios/App/App/Info.plist`

Ejemplo para Android (ya incluido):
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

## 📱 Generar APK/AAB (Android)

### APK de Debug:
1. Abre Android Studio
2. Build > Build Bundle(s) / APK(s) > Build APK(s)
3. El APK estará en `android/app/build/outputs/apk/debug/`

### APK/AAB de Release:
1. Genera un keystore para firmar la app
2. Configura en `android/app/build.gradle`
3. Build > Generate Signed Bundle / APK

## 🍎 Generar IPA (iOS)

1. Abre Xcode
2. Selecciona "Any iOS Device" como destino
3. Product > Archive
4. Sigue el wizard para distribuir

## 🐛 Debugging

### Chrome DevTools (Android):
1. Conecta tu dispositivo Android
2. Abre Chrome y ve a `chrome://inspect`
3. Encuentra tu app y click en "inspect"

### Safari DevTools (iOS):
1. En iOS: Settings > Safari > Advanced > Web Inspector (ON)
2. En macOS: Safari > Preferences > Advanced > Show Develop menu
3. Develop > [Tu dispositivo] > [Tu app]

### Logs nativos:
- **Android**: Android Studio > Logcat
- **iOS**: Xcode > Console

## 📚 Recursos Adicionales

- [Documentación oficial de Capacitor](https://capacitorjs.com/docs)
- [Plugins de Capacitor](https://capacitorjs.com/docs/plugins)
- [Guía de desarrollo de Android](https://capacitorjs.com/docs/android)
- [Guía de desarrollo de iOS](https://capacitorjs.com/docs/ios)

## 🆘 Soporte

Si encuentras problemas:
1. Verifica que todas las dependencias estén actualizadas
2. Limpia y reconstruye: `npm run build && npx cap sync`
3. Revisa los logs en el IDE nativo
4. Consulta la [documentación de Capacitor](https://capacitorjs.com/docs)

---

¡Tu app Splitease ahora está lista para móviles! 🎉
