import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't infer a parent dir
  // (a lockfile exists higher up at ~/Desktop).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
