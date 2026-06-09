import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't infer a parent dir
  // (a lockfile exists higher up at ~/Desktop).
  turbopack: {
    root: __dirname,
  },
  // Base URL of the Express API server. Override per-environment.
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  },
};

export default nextConfig;
