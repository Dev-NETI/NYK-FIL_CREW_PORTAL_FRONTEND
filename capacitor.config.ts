import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.netiaccess.superapp",
  appName: "nykfil-app-frontend",
  webDir: "super-app-mobile/src",
  server: {
    url: "https://super-app.netiaccess.com",
    cleartext: true,
  },
};

export default config;
