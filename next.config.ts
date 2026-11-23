import type { NextConfig } from "next";

// Static export for GitHub Pages. Nothing on this site may need a server at runtime.
// PAGES_BASE_PATH is set by the deploy workflow (actions/configure-pages): it is ""
// once the custom domain is live and "/rioaustralia" while the site is served from
// <user>.github.io/rioaustralia.
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
