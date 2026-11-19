import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents desactivado a propósito: con datos clínicos, nada se cachea
  // salvo que se decida de forma explícita y revisada.
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
