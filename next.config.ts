import type { NextConfig } from "next";
import path from "node:path";

// Evita que Turbopack tome ~/package-lock.json como raíz del workspace.
const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  serverExternalPackages: ["sharp"],
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    // En producción, la ruta vieja manda a la app de suscripciones.
    // En local se deja la página para poder previsualizarla.
    if (process.env.NODE_ENV === "development") return [];
    return [
      {
        source: "/suscripciones",
        destination: "https://suscripciones.oricafe.com.ar/app/ori/join",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
