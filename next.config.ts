import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow the dev server to be accessed from any host (not just localhost)
  // This is required for the Caddy gateway / preview panel to reach the app
  experimental: {
    // Next.js 16: serverActions are allowed by default
  },
};

export default nextConfig;
