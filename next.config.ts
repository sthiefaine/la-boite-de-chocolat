import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    scrollRestoration: true
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
        hostname: 'cz2cmm85bs9kxtd7.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
