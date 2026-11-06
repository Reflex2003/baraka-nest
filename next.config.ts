import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@libsql/client",
    "@libsql/kysely-libsql",
  ],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
