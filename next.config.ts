import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/recruitment',
  output: 'standalone',
  experimental: {
    authInterrupts: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/recruitment/dashboard',
        basePath: false,
        permanent: false,
      },
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
