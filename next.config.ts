import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'uploadfiles.clairdev.com',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'uploadfiles.clairdev.com',
        port: '',
        pathname: '/api/display/**',
      },
      {
        protocol: 'https',
        hostname: 'laboitedechocolat.clairdev.com',
        port: '',
        pathname: '/api/image/masked/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/image/masked/**',
      },
      {
        protocol: 'https',
        hostname: 'laboitedechocolat.clairdev.com',
        port: '',
        pathname: '/api/image/og/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/image/og/**',
      },
      {
        protocol: 'https',
        hostname: 'laboitedechocolat.clairdev.com',
        port: '',
        pathname: '/api/image/og-default',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/image/og-default',
      },
    ],
    qualities: [50, 75, 100],
  },
};

export default nextConfig;
