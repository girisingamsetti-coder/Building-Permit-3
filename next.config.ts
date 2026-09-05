import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Origins the preview proxy uses when requesting /_next/* assets and HMR.
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  experimental: {},
};

export default nextConfig;
