import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  basePath: "/108",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
