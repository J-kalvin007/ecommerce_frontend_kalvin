import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;












// Modifier package.json : "dev": "next dev -H 0.0.0.0 -p 3001"

// import type { NextConfig } from "next";

// const apiUrl = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://192.168.1.200:8000");

// const nextConfig: NextConfig = {
//   // ⬇️ Ajoutez cette ligne pour autoriser l’accès depuis 192.168.1.205
//   allowedDevOrigins: ['192.168.1.205'],   // ou ['*'] pour tout autoriser en développement

//   images: {
//     dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
//     localPatterns: [
//       { pathname: "/**" },
//     ],
//     remotePatterns: [
//       {
//         protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
//         hostname: apiUrl.hostname,
//         ...(apiUrl.port ? { port: apiUrl.port } : {}),
//         pathname: "/media/**",
//       },
//       {
//         protocol: "http",
//         hostname: "**",
//         pathname: "/media/**",
//       }
//     ],
//   },
// };

// export default nextConfig;