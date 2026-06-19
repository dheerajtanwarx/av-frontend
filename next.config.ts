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
  // Serve modern, smaller image formats. Benefits every <Image>, and in
  // particular the /links QR-landing logo (its LCP element) on mobile.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
