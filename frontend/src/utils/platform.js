/**
 * Platform detection utilities for Capacitor native app
 */

import { Capacitor } from '@capacitor/core';

/**
 * Check if the app is running as a native Capacitor app (iOS/Android)
 * Returns false when running in a web browser
 * @returns {boolean}
 */
export const isNativeApp = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch (error) {
    // Capacitor not available, we're in a web environment
    return false;
  }
};

/**
 * Get the current platform (web, ios, android)
 * @returns {string}
 */
export const getPlatform = () => {
  try {
    return Capacitor.getPlatform();
  } catch (error) {
    return 'web';
  }
};

/**
 * Check if running on Android
 * @returns {boolean}
 */
export const isAndroid = () => {
  return getPlatform() === 'android';
};

/**
 * Check if running on iOS
 * @returns {boolean}
 */
export const isIOS = () => {
  return getPlatform() === 'ios';
};
