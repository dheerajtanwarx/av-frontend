import type { NextConfig } from "next";
import withBundleAnalyzerInit from "@next/bundle-analyzer";

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
  // Tree-shake barrel exports of large packages so a single named import
  // (e.g. one lucide icon) doesn't pull the whole module graph into a chunk.
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "motion"],
  },
  // Serve modern, smaller image formats. Benefits every <Image> — and in
  // particular the /links QR-landing logo (its LCP element) on mobile.
  // NOTE: the storefront product/editorial imagery deliberately stays on raw
  // <img> tags pointed at Cloudinary/Unsplash, which already deliver responsive
  // AVIF (f_auto/auto=format) with manual lazy/priority hints — measured faster
  // than routing every image through next/image's server optimizer.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

// Wrap with the analyzer; only emits the report when ANALYZE=true so normal
// builds are unaffected. Run `ANALYZE=true npm run build` to generate it.
const withBundleAnalyzer = withBundleAnalyzerInit({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
