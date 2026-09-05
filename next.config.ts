import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Clerk's Replit-managed setup stores this public value as a secret.
    // Exposing a publishable key to the browser is expected by Clerk.
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.CLERK_PUBLISHABLE_KEY ||
      process.env.VITE_CLERK_PUBLISHABLE_KEY ||
      "",
  },
  allowedDevOrigins: [
    "localhost:5000",
    "127.0.0.1:5000",
    "*.replit.dev",
    "*.repl.co",
    "*.replit.app",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
