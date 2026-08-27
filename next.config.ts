import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  outputFileTracingIncludes: {
    "/*": [
      "./lib/generated/prisma/**/*",
    ],
  },
};

export default nextConfig;
