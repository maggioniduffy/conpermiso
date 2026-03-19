// next.config.mjs
/** @type {import('next').NextConfig} */
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
};

export default nextConfig;
