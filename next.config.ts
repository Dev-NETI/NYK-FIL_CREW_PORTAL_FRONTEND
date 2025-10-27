import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // {
      //     protocol: 'http',
      //     hostname: 'localhost',
      //     port: '8000',
      //     pathname: '/storage/**',
      // },
      {
        protocol: "https",
        hostname: "super-app.netiaccess.com",
        port: "",
        pathname: "/storage/**",
      },
    ],
  },
  typescript: {
    // ✅ Allow production builds even if there are type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ Skip ESLint during builds (e.g., on Vercel)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
