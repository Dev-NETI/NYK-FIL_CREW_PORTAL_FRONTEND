import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
