import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        hostname: 'cz2cmm85bs9kxtd7.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
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
