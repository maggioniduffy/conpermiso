// next.config.mjs
/** @type {import('next').NextConfig} */

import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "conpermiso-images.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "conpermiso-images.s3.us-east-2.amazonaws.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // ← saltear ESLint en build
  },
};

export default pwaConfig(nextConfig);
