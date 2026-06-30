


// Modifier package.json : "dev": "next dev -H 0.0.0.0 -p 3001"


import type { NextConfig } from "next";

const apiUrl = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://outrage-dealer-entrap.ngrok-free.dev");

const nextConfig: NextConfig = {
  // Ajoutez cette ligne pour autoriser l’accès depuis 192.168.1.205
  allowedDevOrigins: ['10.10.0.74'],

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
      }
    ],
  },
};

export default nextConfig;