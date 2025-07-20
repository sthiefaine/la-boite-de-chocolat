import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config) => {
      config.infrastructureLogging = {
        level: 'verbose'
      }
      return config
    }
  }),
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
        hostname: 'la-boite-de-chocolat.vercel.app',
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
        hostname: 'la-boite-de-chocolat.vercel.app',
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
        hostname: 'la-boite-de-chocolat.vercel.app',
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
  },
};

export default nextConfig;
