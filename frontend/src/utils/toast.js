/**
 * Toast utility that uses native Capacitor Toast on mobile
 * and falls back to react-toastify on web
 */

import { toast as reactToast } from 'react-toastify';
import { Toast } from '@capacitor/toast';
import { isNativeApp } from './platform';

/**
 * Show a toast notification
 * Uses native Toast on Capacitor, react-toastify on web
 */
const showToast = async (message, type = 'info') => {
  if (isNativeApp()) {
    // Use native Capacitor Toast (simpler, less intrusive)
    try {
      await Toast.show({
        text: message,
        duration: type === 'error' ? 'long' : 'short',
        position: 'bottom'
      });
    } catch (e) {
      // Fallback to react-toastify if native fails
      reactToast[type](message);
    }
  } else {
    // Use react-toastify on web
    reactToast[type](message);
  }
};

/**
 * Toast API matching react-toastify interface
 */
export const toast = {
  success: (message) => showToast(message, 'success'),
  error: (message) => showToast(message, 'error'),
  info: (message) => showToast(message, 'info'),
  warning: (message) => showToast(message, 'warning'),
  warn: (message) => showToast(message, 'warning'),
};

export default toast;
