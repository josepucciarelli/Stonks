import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Next resolves modules/plugins relative to this project, not a parent dir
  outputFileTracingRoot: __dirname,
  eslint: {
      ignoreDuringBuilds: true,
  }, typescript: {
      ignoreBuildErrors: true
  }
};

export default nextConfig;
