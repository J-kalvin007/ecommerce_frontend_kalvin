/**
 * next.config.ts
 *
 * output: "standalone" — Critical for Docker production builds.
 * Next.js will generate a self-contained server in .next/standalone/
 * that doesn't require node_modules at runtime.
 *
 * allowedDevOrigins — only active in development (ignored in production).
 */

import type { NextConfig } from "next";

const apiUrl = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://outrage-dealer-entrap.ngrok-free.dev");

const nextConfig: NextConfig = {
  // -- Production Docker requirement ---------------------------------
  // Generates .next/standalone/ with a self-contained Node.js server.
  output: "standalone",

  // -- Dev only: allow hot-reload from local network IPs ------------
  allowedDevOrigins: ["10.10.0.74"],

  // -- Image optimization --------------------------------------------
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    localPatterns: [
      { pathname: "/**" },
    ],
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        ...(apiUrl.port ? { port: apiUrl.port } : {}),
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: "/media/**",
      },
    ],
  },

  // -- Security headers (defense-in-depth, nginx adds them too) -----
  // Only active when Next.js is serving directly (without nginx proxy).
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",            value: "SAMEORIGIN" },
          { key: "X-XSS-Protection",           value: "1; mode=block" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;