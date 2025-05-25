import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during build process
  eslint: {
    // Skip ESLint during builds
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during builds (optional)
  typescript: {
    // Skip type checking during builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
