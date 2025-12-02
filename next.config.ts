import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets2.lxns.net',
        port: '',
        pathname: '/maimai/icon/**',
      },
    ],
  },
}


export default nextConfig;
