import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org"
      },
      {
        protocol: "https",
        hostname: "qcbtbbajmvailfolkqoq.supabase.co"
      }
    ]
  },
  // For Three.js (Ethereal component)
  transpilePackages: ["three"]
};

export default nextConfig;
