import type { NextConfig } from "next";

const baseDomain = process.env.TENANT_BASE_DOMAIN || "localfix.app";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.INTERNAL_API_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/api/v1/:path*`,
      },
      {
        source: "/ws/:path*",
        destination: `${apiUrl}/ws/:path*`,
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        baseDomain,
        `*.${baseDomain}`,
        "localfix.app",
        "*.localfix.app",
        "localhost:3000",
        "127.0.0.1:3000",
      ],
    },
  },
};

export default nextConfig;

