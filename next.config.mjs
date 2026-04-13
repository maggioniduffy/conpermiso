// next.config.mjs
import withPWA from "@ducanh2912/next-pwa";
import { withSentryConfig } from "@sentry/nextjs";

const pwaConfig = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    disableDevLogs: true,
    navigationPreload: false,
    additionalManifestEntries: [{ url: "/offline", revision: "1" }],
    runtimeCaching: [
      {
        urlPattern: /^\/offline$/,
        handler: "CacheFirst",
        options: { cacheName: "offline-page" },
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static",
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      {
        urlPattern: /^https:\/\/conpermiso-images\.s3\..*\.amazonaws\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "s3-images",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /^https:\/\/.*\.basemaps\.cartocdn\.com\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "carto-tiles",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
        },
      },
      {
        urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "map-tiles",
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
        },
      },
      {
        urlPattern: /^\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "conpermiso-images.s3.amazonaws.com" },
      {
        protocol: "https",
        hostname: "conpermiso-images.s3.us-east-2.amazonaws.com",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withSentryConfig(pwaConfig(nextConfig), {
  org: "universidad-nacional-del-comah",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: undefined,

  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
