import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Next resolves modules/plugins relative to this project, not a parent dir
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
