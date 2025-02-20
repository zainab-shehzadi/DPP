import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint rules in production builds
  },
  env: {
    API_URL: process.env.NODE_ENV === "production"
      ? "https://209.105.243.7:5000/"
      : "http://209.105.243.7:5000/"
  }

};

export default nextConfig;
