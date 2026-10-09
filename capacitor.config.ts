import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.raclob.macroflow',
  appName: 'MacroFlow',
  webDir: 'dist',
  android: { backgroundColor: '#f6f7f2' },
  plugins: { CapacitorHttp: { enabled: true } },
};
export default config;
