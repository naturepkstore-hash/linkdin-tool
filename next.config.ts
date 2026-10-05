import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/worker/tick': ['./public/uploads/**/*'],
  },
};

export default nextConfig;
