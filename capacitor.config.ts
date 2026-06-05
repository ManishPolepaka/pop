/// <reference types="@capacitor-firebase/authentication" />
/// <reference types="@capacitor/local-notifications" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pop.app',
  appName: 'pop',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com'],
    },
    LocalNotifications: {
      iconColor: '#FACC15',
    },
  },
};

export default config;
