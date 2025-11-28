/**
 * Camera Service para captura de tickets con Capacitor
 * Utiliza el plugin @capacitor/camera (ya instalado)
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { isNativeApp } from './platform';

/**
 * Captura una foto del ticket usando la cámara o galería
 * En app nativa: Abre el selector de cámara/galería de Capacitor con preview
 * En web: Usa el input file del navegador
 * 
 * @returns {Promise<{base64: string, format: string}>} Imagen en base64
 */
export const capturarTicket = async () => {
  if (isNativeApp()) {
    return await capturarConCapacitor();
  } else {
    return await capturarConInputWeb();
  }
};

/**
 * Captura con Capacitor Camera (app nativa)
 * Incluye preview nativo antes de confirmar
 */
const capturarConCapacitor = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 80, // Balance entre calidad OCR y tamaño
      allowEditing: false, // El usuario puede recortar en preview nativo
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt, // Permite elegir entre cámara y galería
      promptLabelHeader: 'Foto del ticket',
      promptLabelPhoto: 'Desde galería',
      promptLabelPicture: 'Tomar foto',
      saveToGallery: false,
      correctOrientation: true,
      presentationStyle: 'fullScreen'
    });

    if (!image.base64String) {
      throw new Error('No se pudo obtener la imagen');
    }

    return {
      base64: image.base64String,
      format: image.format || 'jpeg',
      dataUrl: `data:image/${image.format || 'jpeg'};base64,${image.base64String}`
    };
  } catch (error) {
    if (error.message?.includes('User cancelled')) {
      throw new Error('CANCELADO');
    }
    console.error('Error al capturar con Capacitor:', error);
    throw new Error('No se pudo capturar la imagen. Verifica los permisos de cámara.');
  }
};

/**
 * Captura con input file (navegador web)
 */
const capturarConInputWeb = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Preferir cámara trasera en móviles web
    
    input.onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        reject(new Error('CANCELADO'));
        return;
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('La imagen es demasiado grande. Máximo 10MB.'));
        return;
      }

      try {
        const base64 = await fileToBase64(file);
        const format = file.type.split('/')[1] || 'jpeg';
        
        resolve({
          base64: base64.split(',')[1], // Remover prefijo data:image/...
          format: format,
          dataUrl: base64
        });
      } catch (error) {
        reject(new Error('Error al procesar la imagen.'));
      }
    };

    input.oncancel = () => {
      reject(new Error('CANCELADO'));
    };

    // Trigger click para abrir el selector
    input.click();
  });
};

/**
 * Convierte un File a base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Verifica si la cámara está disponible
 */
export const verificarPermisosCamara = async () => {
  if (!isNativeApp()) {
    return true; // En web siempre disponible via input
  }

  try {
    const permissions = await Camera.checkPermissions();
    return permissions.camera === 'granted' || permissions.camera === 'prompt';
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    return false;
  }
};

const cameraService = {
  capturarTicket,
  verificarPermisosCamara
};

export default cameraService;
