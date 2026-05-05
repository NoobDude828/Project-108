import type { NextConfig } from "next";
import path from "path";

// Read from env so dev can disable the prefix (see .env.development) while production keeps /108.
const envBasePath = process.env.BASE_PATH;
const basePath = envBasePath !== undefined ? envBasePath : "/108";

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;
