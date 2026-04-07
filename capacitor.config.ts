import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.nykfilvoyager",
  appName: "nykfil-voyager",
  webDir: "super-app-mobile/src",
  server: {
    url: "https://nykfilvoyager.com",
    cleartext: true,
  },
};

export default config;
