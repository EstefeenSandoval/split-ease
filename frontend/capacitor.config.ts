import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.splitease.app',
  appName: 'Splitease',
  webDir: 'build',
  server: {
    // Para desarrollo local, descomenta esta línea y usa tu IP local
    // url: 'http://192.168.1.X:3000',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#4F46E5',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
};

export default config;
