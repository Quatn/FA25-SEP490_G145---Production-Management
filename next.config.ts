import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  env: {
    API_URL: process.env.API_URL ?? "http://localhost:4000",
  },
  eslint: {
    // Cho phép build dự án mặc dù có warning (ví dụ như có biến được declare nhưng chưa được sử dụng).
    // Nếu sau này làm quỷ rồi thì để false sau.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
